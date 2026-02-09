"use client"

import React from "react"
import usePlacesAutocomplete, {
} from "use-places-autocomplete"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"

interface LocationInputProps {
  value: string
  onChange: (value: string, details?: any) => void
  className?: string
  placeholder?: string
}

export const LocationInput = ({
  value,
  onChange,
  className,
  placeholder = "Enter job location",
}: LocationInputProps) => {
  const {
    ready,
    value: searchValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    initOnMount: false,
    requestOptions: {
      /* Define search scope here */
    },
    debounce: 300,
    defaultValue: value,
  })

  React.useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const interval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          init()
          clearInterval(interval)
        }
      }, 100)
      return () => clearInterval(interval)
    } else if (typeof window !== "undefined" && window.google && window.google.maps && window.google.maps.places) {
      init()
    }
  }, [init])

  // Sync internal state with prop value if needed (e.g. initial load)
  React.useEffect(() => {
    if (value && value !== searchValue) {
        // Only update if significantly different to avoid loop? 
        // Actually usePlacesAutocomplete manages its own state. 
        // We should just keep them in sync if the parent updates it (like edit mode).
        // But setValue triggers a search if we are not careful.
        // We pass false as second arg to avoid fetching data.
        setValue(value, false); 
    }
  }, [value, setValue]) // Warning: Check dependency loop logic carefully.

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    // We also notify parent of the text change immediately? 
    // Or only on selection? Usually better to notify parent so they can type freely.
    onChange(e.target.value) 
  }

  const handleSelect = ({ place_id, description }: { place_id: string; description: string }) => {
    setValue(description, false)
    clearSuggestions()

    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Google Maps Places API not loaded")
      return
    }

    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'))

    placesService.getDetails(
      {
        placeId: place_id,
        fields: ['address_components', 'geometry', 'formatted_address', 'types'],
      },
      (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const { lat, lng } = place.geometry.location
          const latVal = typeof lat === 'function' ? lat() : lat
          const lngVal = typeof lng === 'function' ? lng() : lng

          const components = place.address_components as google.maps.GeocoderAddressComponent[]
          const getComponent = (type: string) => components.find((c: google.maps.GeocoderAddressComponent) => c.types.includes(type))?.long_name || "";

          const details = {
            address: place.formatted_address || description,
            latitude: latVal,
            longitude: lngVal,
            city: getComponent("locality") || getComponent("postal_town"),
            state: getComponent("administrative_area_level_1"),
            country: getComponent("country"),
            zip_code: getComponent("postal_code"),
            formatted_address: place.formatted_address || description,
            types: place.types,
          }
           
          onChange(description, details)
        } else {
           console.error("Places Service failed: ", status)
        }
      }
    )
  }

  return (
    <div className="relative">
      <Input
        value={searchValue}
        onChange={handleInput}
        disabled={!ready}
        placeholder={placeholder}
        className={className}
      />
      {status === "OK" && (
        <ul className="absolute z-10 w-full bg-white border border-neutral-200 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={() => handleSelect({ place_id, description })}
              className="px-4 py-2 hover:bg-neutral-50 cursor-pointer flex items-center gap-2 text-sm text-neutral-700"
            >
              <MapPin className="w-4 h-4 text-neutral-400" />
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
