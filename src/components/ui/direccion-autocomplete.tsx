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
  label?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  defaultLat?: number;
  defaultLng?: number;
  showMap?: boolean;
  onAddressChange?: (address: string, lat: number | null, lng: number | null, ciudad?: string) => void;
  onPlaceChange?: (place: {
    address: string;
    city: string;
    stateRegion: string;
    postalCode: string;
    country: string;
    lat: number | null;
    lng: number | null;
  }) => void;
};

export function DireccionAutocomplete({
  error,
  label = "Dirección",
  placeholder = "Ingresa la dirección",
  name = "direccion",
  value,
  defaultValue = "",
  defaultLat,
  defaultLng,
  showMap = true,
  onAddressChange,
  onPlaceChange,
}: DireccionAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [comuna, setComuna] = useState("");
  const [scriptReady, setScriptReady] = useState(() =>
    typeof window !== "undefined" && !!window.google?.maps?.places,
  );
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    defaultLat != null && defaultLng != null ? { lat: defaultLat, lng: defaultLng } : null,
  );
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!showMap || !coords || !mapRef.current || !scriptReady || typeof google === "undefined") return;
    const map = new google.maps.Map(mapRef.current, {
      center: coords,
      zoom: 16,
      disableDefaultUI: true,
      zoomControl: true,
    });
    new google.maps.Marker({ position: coords, map });
  }, [coords, scriptReady, showMap]);

  const extractComponent = (components: google.maps.GeocoderAddressComponent[], type: string) =>
    components.find((component) => component.types.includes(type))?.long_name ?? "";

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
      if (inputRef.current) inputRef.current.value = address;

      const components: google.maps.GeocoderAddressComponent[] =
        place.address_components ?? [];
      const route = extractComponent(components, "route");
      const streetNumber = extractComponent(components, "street_number");
      const localidad =
        extractComponent(components, "locality") ||
        extractComponent(components, "administrative_area_level_2") ||
        extractComponent(components, "sublocality") ||
        "";
      const region = extractComponent(components, "administrative_area_level_1");
      const postalCode = extractComponent(components, "postal_code");
      const country = extractComponent(components, "country");
      setComuna(localidad);

      const location = place.geometry?.location;
      const lat = location?.lat() ?? null;
      const lng = location?.lng() ?? null;

      if (lat != null && lng != null) {
        setCoords({ lat, lng });
      }

      onAddressChange?.(address, lat, lng, localidad);
      onPlaceChange?.({
        address: address || [route, streetNumber].filter(Boolean).join(" "),
        city: localidad,
        stateRegion: region,
        postalCode,
        country,
        lat,
        lng,
      });
    });

    autocompleteRef.current = autocomplete;
  }, [scriptReady, onAddressChange, onPlaceChange]);

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
          <span className="font-medium text-zinc-700">{label}</span>
          <input
            ref={inputRef}
            required
            name={name}
            {...(value !== undefined ? { value } : { defaultValue })}
            onChange={(event) => {
              setCoords(null);
              setComuna("");
              onAddressChange?.(event.target.value, null, null, undefined);
              onPlaceChange?.({
                address: event.target.value,
                city: "",
                stateRegion: "",
                postalCode: "",
                country: "",
                lat: null,
                lng: null,
              });
            }}
            placeholder={placeholder}
            autoComplete="off"
            className="rounded-xl border border-zinc-300 px-3 py-2.5 outline-none transition focus:border-zinc-900 aria-[invalid]:border-rose-400"
            aria-invalid={!!error || undefined}
          />
          {error ? <span className="text-xs text-rose-600">{error}</span> : null}
        </label>

        {showMap ? (
          <div
            ref={mapRef}
            className={coords ? "h-48 w-full overflow-hidden rounded-xl border border-zinc-200" : "hidden"}
          />
        ) : null}
      </div>

      <input type="hidden" name="ciudad" value={comuna} />
      <input type="hidden" name="latitud" value={coords?.lat ?? ""} />
      <input type="hidden" name="longitud" value={coords?.lng ?? ""} />
    </>
  );
}
