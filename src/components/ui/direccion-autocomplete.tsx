/// <reference types="google.maps" />

"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: typeof google;
  }
}

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
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [comuna, setComuna] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    defaultLat != null && defaultLng != null ? { lat: defaultLat, lng: defaultLng } : null,
  );
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Show map for pre-existing coords (edit mode)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google?.maps?.places && !scriptReady) {
      setScriptReady(true);
    }
  }, [scriptReady]);

  useEffect(() => {
    if (!coords || !mapRef.current || !scriptReady || typeof google === "undefined") return;
    const map = new google.maps.Map(mapRef.current, {
      center: coords,
      zoom: 16,
      disableDefaultUI: true,
      zoomControl: true,
    });
    new google.maps.Marker({ position: coords, map });
  }, [coords, scriptReady]);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (!scriptReady || !inputRef.current || typeof google === "undefined") return;
    if (autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "cl" },
      fields: ["formatted_address", "address_components", "geometry"],
      types: ["address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      const address = place.formatted_address ?? "";
      setValue(address);
      if (inputRef.current) inputRef.current.value = address;

      const components: google.maps.GeocoderAddressComponent[] =
        place.address_components ?? [];
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
    });

    autocompleteRef.current = autocomplete;
  }, [scriptReady]);

  return (
    <>
      {apiKey ? (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
          onReady={() => {
            setScriptReady(true);
          }}
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
            onChange={(e) => {
              setValue(e.target.value);
              setCoords(null);
              setComuna("");
            }}
            placeholder="Ingresa la dirección del evento"
            autoComplete="off"
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
