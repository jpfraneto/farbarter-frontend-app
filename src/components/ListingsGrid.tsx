import React from "react";
import { formatUnits } from "ethers";
import Link from "next/link";

interface ListingCardProps {
  listing: {
    id: number;
    seller: string;
    fid: number;
    price: string;
    remainingSupply: number;
    metadata: string;
    isActive: boolean;
    totalSales: number;
    imageUrl?: string;
    sellerProfile?: {
      username: string;
      displayName: string;
      pfp: string;
    };
  };
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const formatPrice = (price: string) => {
    return Number(formatUnits(price, 6)).toFixed(2);
  };
  console.log("INSIDE THE LISTING CARD", listing);

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-[#1A1625]/90 rounded-xl border border-[#7C3AED] overflow-hidden hover:border-[#A855F7] transition-all duration-300">
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={listing.imageUrl}
            alt={`Listing ${listing.id}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-[#1A1625]/90 px-3 py-1 rounded-full border border-[#7C3AED]">
            <span className="text-sm font-medium">
              {formatPrice(listing.price)} USDC
            </span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {listing.sellerProfile?.pfp && (
                <img
                  src={listing.sellerProfile.pfp}
                  alt="Seller"
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-[#E2E8F0]/90 text-sm">
                @{listing.sellerProfile?.username || "unknown"}
              </span>
            </div>
            <span className="text-[#E2E8F0]/70 text-sm">#{listing.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#E2E8F0]/80 text-sm">
              Available: {listing.remainingSupply}
            </span>
            <span className="text-[#E2E8F0]/80 text-sm">
              Sales: {listing.totalSales}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ListingsGrid = ({
  listings,
}: {
  listings: ListingCardProps["listing"][];
}) => {
  return (
    <div className="w-full max-w-6xl mb-16">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#A855F7]">
        🏪 Active Listings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export default ListingsGrid;
