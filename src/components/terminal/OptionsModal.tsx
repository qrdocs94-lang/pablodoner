"use client";
// src/components/terminal/OptionsModal.tsx

import { useState } from "react";
import { Product, OptionSchema, formatPrice } from "@/types";

interface Props {
  product: Product;
  onClose: () => void;
  onConfirm: (options: Record<string, string | string[]>) => void;
}

export default function OptionsModal({ product, onClose, onConfirm }: Props) {
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const hasOptions = product.options_schema.length > 0;

  const handleSelect = (schema: OptionSchema, value: string) => {
    if (schema.type === "select") {
      setSelections((prev) => ({ ...prev, [schema.key]: value }));
    } else {
      // multiselect: toggle
      setSelections((prev) => {
        const current = (prev[schema.key] as string[]) ?? [];
        const exists = current.includes(value);
        return {
          ...prev,
          [schema.key]: exists ? current.filter((v) => v !== value) : [...current, value],
        };
      });
    }
  };

  const handleConfirm = () => {
    // Validate required fields
    const errs: string[] = [];
    for (const schema of product.options_schema) {
      if (schema.required) {
        const val = selections[schema.key];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          errs.push(`Bitte "${schema.label}" wählen`);
        }
      }
    }
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    onConfirm(selections);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[90vh] flex flex-col z-10 shadow-2xl">
        {/* Handle */}
        <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-black text-[#1A0800] text-xl">{product.name}</h3>
            <div className="text-[#C0392B] font-black text-lg">{formatPrice(product.price_cents)}</div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {!hasOptions && (
            <p className="text-[#7D6248] text-center py-4">
              Dieses Produkt hat keine Optionen. Einfach in den Warenkorb!
            </p>
          )}

          {product.options_schema.map((schema) => (
            <div key={schema.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-black text-[#1A0800] text-base">{schema.label}</span>
                {schema.required && (
                  <span className="text-xs font-bold text-white bg-[#C0392B] px-2 py-0.5 rounded-full">
                    Pflicht
                  </span>
                )}
                {schema.type === "multiselect" && (
                  <span className="text-xs text-[#7D6248]">Mehrfachauswahl möglich</span>
                )}
              </div>

              <div className={`grid gap-2 ${schema.type === "select" ? "grid-cols-2" : "grid-cols-1"}`}>
                {schema.options.map((opt) => {
                  const isSelected =
                    schema.type === "select"
                      ? selections[schema.key] === opt
                      : ((selections[schema.key] as string[]) ?? []).includes(opt);

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(schema, opt)}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-bold text-left transition-all active:scale-[0.98] ${
                        isSelected
                          ? "border-[#C0392B] bg-[#FFF0EE] text-[#C0392B]"
                          : "border-gray-200 text-[#4A3728] hover:border-[#C0392B]"
                      }`}
                    >
                      {isSelected ? "✓ " : ""}{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              {errors.map((e, i) => (
                <div key={i} className="text-red-700 text-sm font-medium">⚠️ {e}</div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm button */}
        <div className="px-6 py-5 border-t border-gray-100">
          <button
            onClick={handleConfirm}
            className="w-full bg-[#C0392B] hover:bg-[#A01F1F] text-white font-black text-lg py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg"
          >
            IN DEN WARENKORB 🛒
          </button>
        </div>
      </div>
    </div>
  );
}
