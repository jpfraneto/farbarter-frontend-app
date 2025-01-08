"use client";

import { useState, useEffect } from "react";
import ListingsGrid from "./ListingsGrid";

interface Props {
  title?: string;
}

interface Listing {
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
}

interface ListingData {
  id: number;
  seller: string;
  fid: number;
  price: string;
  remainingSupply: number;
  metadata: string;
  isActive: boolean;
  totalSales: number;
}

interface ProfileData {
  fid: number;
  username: string;
  displayName: string;
  pfp: string;
}

export default function Landing({ title = "farbarter" }: Props) {
  console.log("🚀 Launching Landing component...");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🎯 Initial useEffect triggered");
    fetchListings();
  }, []);

  const fetchListings = async () => {
    console.log("📋 Fetching listings...");
    try {
      // Fetch listings from Ponder indexer
      const response = await fetch("https://ponder.farbarter.com/listings");
      const json_response = await response.json();
      const listingsData = json_response.items as ListingData[];
      console.log(listingsData);
      console.log(
        "📦 Raw listings data received:",
        listingsData.length,
        "items"
      );

      // Get unique FIDs to fetch user profiles
      const fids = [...new Set(listingsData.map((l) => l.fid))];
      console.log("👥 Unique FIDs found:", fids.length);

      // Fetch user profiles from Farcaster
      const profilesResponse = await fetch(
        `https://farcaster.anky.bot/farcaster/user/bulk?fids=${fids.join(",")}`
      );
      const json_profilesResponse = await profilesResponse.json();
      const profilesData = json_profilesResponse.users as ProfileData[];
      console.log(profilesData);
      console.log("👤 Profiles fetched:", profilesData.length);

      // Fetch metadata for each listing
      const enhancedListings = await Promise.all(
        listingsData.map(async (listing: ListingData) => {
          try {
            const metadataResponse = await fetch(
              `https://anky.mypinata.cloud/ipfs/${listing.metadata}`
            );
            const metadata = await metadataResponse.json();
            return {
              ...listing,
              imageUrl: metadata.imageUrl,
              sellerProfile: profilesData.find((p) => p.fid === listing.fid),
            };
          } catch (error) {
            console.error(
              `Error fetching metadata for listing ${listing.id}:`,
              error
            );
            return {
              ...listing,
              imageUrl: `https://picsum.photos/seed/${listing.id}/400/300`, // Fallback image
              sellerProfile: profilesData.find((p) => p.fid === listing.fid),
            };
          }
        })
      );

      console.log(enhancedListings);
      console.log("✨ Enhanced listings created:", enhancedListings.length);

      setListings(enhancedListings);
    } catch (error) {
      console.error("💥 Error fetching listings:", error);
    } finally {
      console.log("🏁 Finished loading listings");
      setLoading(false);
    }
  };

  console.log("🎨 Rendering component with", listings.length, "listings");
  return (
    <div className="min-h-screen bg-[#13111C] text-[#E2E8F0] relative font-[Space_Grotesk]">
      <div className="min-h-screen flex flex-col items-center p-8 relative bg-[radial-gradient(circle_at_top_right,#7C3AED_0%,transparent_60%),radial-gradient(circle_at_bottom_left,#C084FC_0%,transparent_60%)]">
        <h1 className="text-7xl md:text-8xl font-bold my-8 bg-gradient-to-r from-[#A855F7] via-[#7C3AED] to-[#6366F1] bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_40px_rgba(124,58,237,0.5)] animate-pulse">
          {title}
        </h1>

        <h2 className="text-3xl text-center max-w-2xl mb-6 text-[#E2E8F0]/90">
          The First On-Chain P2P Marketplace for Farcaster
        </h2>

        <p className="text-xl text-center max-w-2xl mb-12 text-[#E2E8F0]/80">
          Trade anything, anywhere, with anyone – secured by smart contracts and
          powered by your reputation.
        </p>

        {loading ? (
          <div className="w-full max-w-6xl flex items-center justify-center mb-16">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#7C3AED]" />
          </div>
        ) : (
          <ListingsGrid listings={listings} />
        )}

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#1A1625]/90 p-8 rounded-xl border border-[#7C3AED]">
            <h3 className="text-2xl font-bold mb-4 text-[#A855F7]">
              🤝 Sell With Confidence
            </h3>
            <p className="text-[#E2E8F0]/80">
              List your digital goods, services, or collectibles in seconds.
              Just tag @farbarterbot with your price and description. Our escrow
              system ensures you get paid when the deal is done.
            </p>
          </div>

          <div className="bg-[#1A1625]/90 p-8 rounded-xl border border-[#7C3AED]">
            <h3 className="text-2xl font-bold mb-4 text-[#A855F7]">
              🌈 Accept Any Payment
            </h3>
            <p className="text-[#E2E8F0]/80">
              Buyers can pay with any token on any chain. You set your preferred
              payment method, but stay flexible to capture more sales. Smart
              contracts handle the complexity – you just get paid.
            </p>
          </div>

          <div className="bg-[#1A1625]/90 p-8 rounded-xl border border-[#7C3AED]">
            <h3 className="text-2xl font-bold mb-4 text-[#A855F7]">
              ⚡ Lightning Fast Listings
            </h3>
            <p className="text-[#E2E8F0]/80">
              No complicated forms. No lengthy approval process.
              <br />
              1. Tag @farbarterbot
              <br />
              2. Set your price
              <br />
              3. You&apos;re live!
            </p>
          </div>
        </div>

        <div className="w-full max-w-6xl mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#A855F7]">
            🛡️ Built-in Protection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1A1625]/80 p-6 rounded-xl border border-[#7C3AED]">
              <p className="text-center text-[#E2E8F0]">
                Smart contract escrow
              </p>
            </div>
            <div className="bg-[#1A1625]/80 p-6 rounded-xl border border-[#7C3AED]">
              <p className="text-center text-[#E2E8F0]">Reputation scoring</p>
            </div>
            <div className="bg-[#1A1625]/80 p-6 rounded-xl border border-[#7C3AED]">
              <p className="text-center text-[#E2E8F0]">Dispute resolution</p>
            </div>
            <div className="bg-[#1A1625]/80 p-6 rounded-xl border border-[#7C3AED]">
              <p className="text-center text-[#E2E8F0]">
                7-day safety timelock
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-[#A855F7]">
            💫 Reputation Matters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1A1625]/90 p-8 rounded-xl border border-[#7C3AED]">
              <h3 className="text-xl font-bold mb-4 text-[#E2E8F0]">
                Build Trust Through Trading
              </h3>
              <ul className="space-y-2 text-[#E2E8F0]/80">
                <li>• More visibility for your listings</li>
                <li>• Access to premium features</li>
                <li>• &quot;Trusted Seller&quot; badge</li>
                <li>• Lower fees (coming soon)</li>
              </ul>
            </div>
            <div className="bg-[#1A1625]/90 p-8 rounded-xl border border-[#7C3AED]">
              <h3 className="text-xl font-bold mb-4 text-[#E2E8F0]">
                True Ownership
              </h3>
              <ul className="space-y-2 text-[#E2E8F0]/80">
                <li>• Your listings, your rules</li>
                <li>• Keep full custody of your assets</li>
                <li>• Choose your payment preferences</li>
                <li>• Set your own terms</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl bg-[#1A1625]/90 p-8 rounded-xl border border-[#7C3AED] mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center text-[#A855F7]">
            🚀 Getting Started
          </h2>
          <div className="space-y-4 text-center">
            <p className="text-[#E2E8F0]/80">1. Have a Farcaster account</p>
            <p className="text-[#E2E8F0]/80">
              2. Tag @farbarterbot with what you want to sell
            </p>
            <p className="text-[#E2E8F0]/80">3. Set your price in USDC</p>
            <p className="text-[#E2E8F0]/80">4. Share with your audience!</p>
          </div>
        </div>

        <div className="text-center max-w-2xl mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[#A855F7]">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-[#E2E8F0]/90 mb-6">
            Tag @farbarterbot in a cast with what you want to sell. Join the
            fastest-growing P2P marketplace in the Farcaster ecosystem.
          </p>
          <p className="text-[#E2E8F0]/70 italic">
            *Powered by smart contracts. Protected by reputation. Built for
            you.*
          </p>
        </div>
      </div>
    </div>
  );
}
