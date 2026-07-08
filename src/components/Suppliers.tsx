"use client";

/**
 * Suppliers & Reorder Book — who Karmel buys from and what. One card per
 * supplier: what she orders there, how to reach them, and what they're best
 * for, so reordering is a glance instead of a receipt hunt.
 */

import { Bot, ExternalLink, Store } from "lucide-react";
import { SUPPLIERS } from "@/lib/suppliers";

function askEve(prompt: string) {
  window.dispatchEvent(new CustomEvent("eve-ask", { detail: prompt }));
}

export function Suppliers() {
  return (
    <div className="section-stack">
      <div className="section-intro">
        <h2>Suppliers &amp; Reorder Book</h2>
        <p>
          Every seed, mat, and bulb in your greenhouse came from somewhere — this is your book of
          exactly where. When a packet runs low or a mat wears out, look up who you bought it from
          and reorder without hunting through old receipts.
        </p>
      </div>

      <div className="ref-grid">
        {SUPPLIERS.map((supplier) => (
          <article key={supplier.key} className="gh-card">
            <h3>
              {supplier.emoji} {supplier.name}
            </h3>
            {supplier.since && <p className="ref-kv">{supplier.since}</p>}
            {supplier.url && (
              <a
                className="wish-buy"
                href={`https://${supplier.url}`}
                target="_blank"
                rel="noreferrer"
              >
                {supplier.url} <ExternalLink size={12} />
              </a>
            )}
            {supplier.contact && <p className="ref-kv">{supplier.contact}</p>}
            <ul>
              {supplier.products.map((product) => (
                <li key={product}>{product}</li>
              ))}
            </ul>
            <p className="gh-hint">Best for: {supplier.goodFor}</p>
          </article>
        ))}
      </div>

      <div className="gh-card">
        <h3>
          <Store size={16} /> Adding to the book
        </h3>
        <p>
          Whenever Eve records a purchase for you, the new supplier lands here automatically — so
          your reorder book grows every time you do.
        </p>
        <button
          className="secondary-button"
          onClick={() => askEve("Where did I buy my microgreens mats and what was the SKU?")}
        >
          <Bot size={14} /> Ask Eve
        </button>
      </div>
    </div>
  );
}
