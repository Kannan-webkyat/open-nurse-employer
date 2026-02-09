"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"

interface Option {
    value: string | number
    label: string
}

interface SearchableSelectProps {
    options: Option[]
    value: string | number
    onChange: (value: string | number) => void
    onSelect?: (value: string | number) => void
    placeholder?: string
    className?: string
    clearOnSelect?: boolean
}

export function SearchableSelect({
    options,
    value,
    onChange,
    onSelect,
    placeholder = "Select option...",
    className = "",
    clearOnSelect = false,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Determine display value
    const getDisplayValue = () => {
        if (clearOnSelect) return "" // Always empty if clearing
        const selectedOption = options.find((opt) => opt.value === value)
        if (selectedOption) return selectedOption.label
        if (typeof value === "string") return value
        return ""
    }

    const [inputValue, setInputValue] = useState(getDisplayValue())

    // Sync input value with prop value changes
    useEffect(() => {
        if (!clearOnSelect) {
            setInputValue(getDisplayValue())
        }
    }, [value, options, clearOnSelect])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        onChange(newValue) // Allow manual typing value
        setIsOpen(true)
    }

    const handleOptionSelect = (option: Option) => {
        if (onSelect) {
            onSelect(option.value)
        } else {
            onChange(option.value)
        }

        if (clearOnSelect) {
            setInputValue("")
            onChange("") // Reset parent value if controlled
        } else {
            setInputValue(option.label)
        }
        setIsOpen(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            if (inputValue.trim()) {
                const option = options.find((opt) => opt.label.toLowerCase() === inputValue.toLowerCase())
                const val = option ? option.value : inputValue

                if (onSelect) {
                    onSelect(val)
                } else {
                    onChange(val)
                }

                if (clearOnSelect) {
                    setInputValue("")
                    onChange("")
                } else {
                    setIsOpen(false)
                }
            }
        }
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full h-9 sm:h-10 rounded-lg border border-neutral-300 bg-white pl-3 pr-10 text-xs sm:text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
                <div
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronDown
                        className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="overflow-y-auto flex-1 p-1">
                        {filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleOptionSelect(option)}
                                className={`px-3 py-2 text-xs sm:text-sm cursor-pointer rounded-md transition-colors ${option.value === value
                                        ? "bg-sky-50 text-sky-700 font-medium"
                                        : "text-neutral-700 hover:bg-neutral-50"
                                    }`}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
