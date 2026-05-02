"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type DireccionAutocompleteProps = {
  error?: string;
  defaultValue?: string;
  defaultLat?: number;
  defaultLng?: number;
};

export function DireccionAutocomplete({
  error,
  defaultValue = "",
  defaultLat,
  defaultLng,
}: DireccionAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [comuna, setComuna] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    defaultLat != null && defaultLng != null ? { lat: defaultLat, lng: defaultLng } : null,
  );
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Show map for pre-existing coords (edit mode)
  useEffect(() => {
    if (!coords || !mapRef.current || !window.google) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: coords,
      zoom: 16,
      disableDefaultUI: true,
      zoomControl: true,
    });
    new window.google.maps.Marker({ position: coords, map });
  }, [coords]);

  function initAutocomplete() {
    if (!inputRef.current || !window.google) return;

    // If we already have coords from edit mode, render the map now
    if (coords && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
      });
      new window.google.maps.Marker({ position: coords, map });
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "cl" },
      fields: ["formatted_address", "address_components", "geometry"],
      types: ["address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      const address = place.formatted_address ?? "";
      setValue(address);
      if (inputRef.current) inputRef.current.value = address;

      const components = place.address_components ?? [];
      const localidad =
        components.find((c) => c.types.includes("locality"))?.long_name ??
        components.find((c) => c.types.includes("sublocality"))?.long_name ??
        "";
      setComuna(localidad);

      const location = place.geometry?.location;
      if (!location) return;

      const lat = location.lat();
      const lng = location.lng();
      setCoords({ lat, lng });

      if (!mapRef.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
      });
      new window.google.maps.Marker({ position: { lat, lng }, map });
    });
  }

  return (
    <>
      {apiKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
          onLoad={initAutocomplete}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Dirección</span>
          <input
            ref={inputRef}
            required
            name="direccion"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ingresa la dirección del evento"
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
            aria-invalid={!!error || undefined}
          />
          {error ? <span className="text-xs text-rose-600">{error}</span> : null}
        </label>

        <div
          ref={mapRef}
          className={coords ? "h-48 w-full overflow-hidden rounded-xl border border-zinc-200" : "hidden"}
        />
      </div>

      <input type="hidden" name="ciudad" value={comuna} />
      <input type="hidden" name="latitud" value={coords?.lat ?? ""} />
      <input type="hidden" name="longitud" value={coords?.lng ?? ""} />
    </>
  );
}
