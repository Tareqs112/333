import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { X, ChevronDown } from 'lucide-react';

const AutocompleteInput = ({ 
  value, 
  onChange, 
  placeholder = "Tur adı yazın...", 
  options = [],
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);

  // Varsayılan tur listesi
  const defaultTours = [
    'TR AIRPORT TRANSFER',
    'TRABZON TOUR',
    'HAMSIKOY TOUR',
    'UZUNGOL TRANSFER+TOUR',
    'SULTANMURAD TOUR',
    'RIZE TRANSFER+TOUR',
    'RIZE TOUR',
    'AYDER TOUR',
    'TRABZON TRANSFER+TOUR',
    'HIDIRNEBI TOUR'
  ];

  // Tüm seçenekleri birleştir (varsayılan + kullanıcı tanımlı)
  const allOptions = [...new Set([...defaultTours, ...options])];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (value) {
      const filtered = allOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(allOptions);
    }
    setHighlightedIndex(-1);
  }, [value, options]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!value) {
      setFilteredOptions(allOptions);
    }
  };

  const handleOptionClick = (option) => {
    onChange(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        } else if (value.trim()) {
          // Eğer liste açık değilse veya hiçbir seçenek vurgulanmamışsa, mevcut değeri kabul et
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const clearInput = () => {
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else {
      setIsOpen(true);
      setFilteredOptions(allOptions);
      inputRef.current?.focus();
    }
  };

  // Vurgulanan öğeyi görünür alanda tut
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-16"
          autoComplete="off"
        />
        
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {value && (
            <button
              type="button"
              onClick={clearInput}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              tabIndex={-1}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          <button
            type="button"
            onClick={toggleDropdown}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            tabIndex={-1}
          >
            <ChevronDown 
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            <ul ref={listRef} className="py-1">
              {filteredOptions.map((option, index) => (
                <li
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    index === highlightedIndex
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {value ? `"${value}" için sonuç bulunamadı` : 'Seçenek bulunamadı'}
            </div>
          )}
          
          {value && !allOptions.includes(value) && (
            <div className="border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleOptionClick(value)}
                className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors"
              >
                "{value}" olarak ekle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;

