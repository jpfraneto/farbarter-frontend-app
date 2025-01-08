"use client";

import { useEffect, useState } from "react";
import { getListingDetails } from "../../lib/listings";
import { ListingImage } from "./ListingImage";
import { ListingStats } from "./ListingStats";
import { ListingHeader } from "./ListingHeader";
import { ListingAction } from "./ListingAction";
import type { ListingDetails } from "../../lib/listings";

interface ListingContainerProps {
  listingId: string;
}

export default function ListingContainer({ listingId }: ListingContainerProps) {
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        const data = await getListingDetails(listingId);
        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listing");
      }
    }
    fetchListing();
  }, [listingId]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6">
          <h1 className="text-2xl font-bold text-red-400 font-mono">ERROR</h1>
          <p className="mt-4 text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-900 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-slate-800 rounded-t-lg" />
            <div className="h-8 bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.15)] md:h-[800px]">
        <div className="h-full flex flex-col">
          <ListingImage
            imageUrl={listing.metadata.imageUrl}
            alt={listing.metadata.name}
          />

          <div className="flex-1 p-6 space-y-6">
            <ListingHeader
              listingId={listingId}
              name={listing.metadata.name}
              description={listing.metadata.description}
            />

            <ListingStats
              price={listing.price}
              remainingSupply={listing.remainingSupply}
              totalSupply={listing.metadata.supply}
              location={listing.metadata.location}
              isOnline={listing.metadata.isOnline}
              fid={listing.fid}
            />

            <ListingAction
              isActive={listing.isActive}
              remainingSupply={listing.remainingSupply}
              name={listing.metadata.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
