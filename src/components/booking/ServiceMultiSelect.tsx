/**
 * ServiceMultiSelect Component
 * Multi-select dropdown for choosing therapy services
 */

import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { getAllServices, getServiceDisplayName } from '@/lib/consentContent';

interface ServiceMultiSelectProps {
  selectedServices: string[];
  onChange: (selectedIds: string[]) => void;
  error?: string;
}

export function ServiceMultiSelect({
  selectedServices,
  onChange,
  error,
}: ServiceMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const services = getAllServices();

  const handleSelect = (serviceId: string) => {
    const isSelected = selectedServices.includes(serviceId);
    if (isSelected) {
      onChange(selectedServices.filter((id) => id !== serviceId));
    } else {
      onChange([...selectedServices, serviceId]);
    }
  };

  const handleRemove = (serviceId: string) => {
    onChange(selectedServices.filter((id) => id !== serviceId));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Select Services <span className="text-red-500">*</span>
      </label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select services"
            className={cn(
              'w-full justify-between',
              error && 'border-red-500 focus:ring-red-500'
            )}
          >
            <span className="text-gray-500">
              {selectedServices.length === 0
                ? 'Select one or more services...'
                : `${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} selected`}
            </span>
            <Check className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search services..." />
            <CommandEmpty>No service found.</CommandEmpty>
            <CommandGroup>
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <CommandItem
                    key={service.id}
                    value={service.name}
                    onSelect={() => handleSelect(service.id)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <span className="flex-1">{service.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Services Display */}
      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedServices.map((serviceId) => (
            <Badge
              key={serviceId}
              variant="secondary"
              className="px-3 py-1 text-sm"
            >
              {getServiceDisplayName(serviceId)}
              <button
                type="button"
                onClick={() => handleRemove(serviceId)}
                className="ml-2 hover:text-red-600 focus:outline-none"
                aria-label={`Remove ${getServiceDisplayName(serviceId)}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
