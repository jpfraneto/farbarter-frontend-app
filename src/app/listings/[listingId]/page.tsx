"use client";

import { Metadata } from "next";
import farbarter_abi from "../../../lib/farbarter_abi.json";
import { createPublicClient, formatUnits, http, type Address } from "viem";
import Image from "next/image";
import { degen } from "viem/chains";
import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

console.log("🚀 Initializing Farbarter listing page...");

const FARBARTER_CONTRACT_ADDRESS =
  "0x8d59e8ef33fb819979ad09fb444a26792970fb6f" as Address;

const client = createPublicClient({
  chain: degen,
  transport: http(),
});

console.log("🔌 Created public client connection");

interface ListingMetadata {
  imageUrl?: string;
  name: string;
  description: string;
  supply: number;
  location: string;
  isOnline: boolean;
}

interface ListingDetails {
  seller: string;
  fid: number;
  price: string;
  remainingSupply: number;
  metadata: ListingMetadata;
  isActive: boolean;
  totalSales: number;
  preferredToken: string;
  preferredChain: number;
}

async function getListingDetails(listingId: string): Promise<ListingDetails> {
  console.log(`🔍 Fetching details for listing #${listingId}...`);

  if (!listingId || isNaN(Number(listingId))) {
    console.error("❌ Invalid listing ID provided");
    throw new Error("Invalid listing ID");
  }

  try {
    console.log(
      "📡 Making contract call to getListingDetails for listing #",
      listingId
    );
    const details = (await client.readContract({
      address: FARBARTER_CONTRACT_ADDRESS,
      abi: farbarter_abi,
      functionName: "getListingDetails",
      args: [BigInt(listingId)],
    })) as [
      Address,
      bigint,
      bigint,
      bigint,
      string,
      boolean,
      bigint,
      string,
      bigint
    ];

    console.log("the details are ", details);
    const metadata = await fetchMetadataFromIpfs(details[4]);

    console.log(
      "✅ Successfully fetched listing details and metadata. the metadata is ",
      metadata
    );
    return {
      seller: details[0],
      fid: Number(details[1]),
      price: formatUnits(details[2], 6),
      remainingSupply: Number(details[3]),
      metadata,
      isActive: details[5],
      totalSales: Number(details[6]),
      preferredToken: details[7],
      preferredChain: Number(details[8]),
    };
  } catch (error) {
    console.error("❌ Error fetching listing details:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch listing details: ${error.message}`);
    }
    throw new Error("Failed to fetch listing details");
  }
}

async function fetchMetadataFromIpfs(ipfsHash: string) {
  try {
    const metadataResponse = await axios.get(
      `https://anky.mypinata.cloud/ipfs/${ipfsHash}`
    );
    console.log("the metadataresponse is: ", metadataResponse);
    const data = metadataResponse.data;
    return data;
  } catch (error) {
    console.error("❌ Error fetching metadata from IPFS:", error);
    throw new Error("Failed to fetch metadata from IPFS");
  }
}

interface GenerateMetadataProps {
  params: {
    listingId: string;
  };
}

export async function generateMetadata({
  params,
}: GenerateMetadataProps): Promise<Metadata> {
  console.log("📝 Generating metadata for listing page...");
  try {
    const listing = await getListingDetails(params.listingId);
    console.log("✨ Generated metadata successfully");
    return {
      title: `${listing.metadata.name} | Farbarter`,
      description: listing.metadata.description,
      openGraph: {
        title: listing.metadata.name,
        description: listing.metadata.description,
        images: listing.metadata.imageUrl ? [listing.metadata.imageUrl] : [],
      },
    };
  } catch {
    console.warn("⚠️ Using fallback metadata due to error");
    return {
      title: "Listing | Farbarter",
      description: "View listing details on Farbarter",
    };
  }
}

// function LoadingSkeleton() {
//   console.log("⌛ Rendering loading skeleton...");
//   return (
//     <div className="animate-pulse">
//       <div className="h-48 bg-gray-200 rounded-t-lg md:w-48" />
//       <div className="p-8">
//         <div className="h-4 bg-gray-200 rounded w-1/4" />
//         <div className="h-6 bg-gray-200 rounded mt-2 w-3/4" />
//         <div className="h-20 bg-gray-200 rounded mt-4" />
//         <div className="grid grid-cols-2 gap-4 mt-6">
//           {[...Array(4)].map((_, i) => (
//             <div key={i}>
//               <div className="h-4 bg-gray-200 rounded w-1/2" />
//               <div className="h-6 bg-gray-200 rounded mt-1" />
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

interface ListingPageProps {
  params: {
    listingId: string;
  };
}

export default function ListingPage({ params }: ListingPageProps) {
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const searchParams = useSearchParams();
  console.log("the search params are: ", searchParams);

  try {
    console.log("the search params are: ", searchParams);
    useEffect(() => {
      const listingId = searchParams.get("listingId");
      console.log("the listingId is: ", listingId);
      async function getListingDetailsFunction() {
        const listing = await getListingDetails(listingId!);
        setListing(listing);
      }
      getListingDetailsFunction();
    }, [searchParams]);

    if (!listing) return <div>Loading...</div>;

    return (
      <div className="min-h-screen bg-slate-900 px-4 py-8 flex items-center justify-center">
        {/* Phone container for desktop */}
        <div className="w-full max-w-md mx-auto bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.15)] md:h-[800px]">
          {/* Content wrapper */}
          <div className="h-full flex flex-col">
            {/* Image section */}
            <div className="relative w-full h-64">
              <Suspense
                fallback={
                  <div className="w-full h-full bg-slate-800 animate-pulse" />
                }
              >
                {listing.metadata.imageUrl && (
                  <Image
                    src={listing.metadata.imageUrl}
                    alt={listing.metadata.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 448px"
                  />
                )}
              </Suspense>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
            </div>

            {/* Content section */}
            <div className="flex-1 p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="text-cyan-400 text-sm font-mono">
                  Listing #{params.listingId}
                </div>
                <h1 className="mt-1 text-2xl font-bold text-white">
                  {listing.metadata.name}
                </h1>
                <p className="mt-2 text-slate-400">
                  {listing.metadata.description}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-700">
                <div>
                  <h3 className="text-sm font-mono text-cyan-400">Price</h3>
                  <p className="mt-1 text-xl font-bold text-white">
                    {listing.price} USDC
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-mono text-cyan-400">Available</h3>
                  <p className="mt-1 text-xl font-bold text-white">
                    {listing.remainingSupply} / {listing.metadata.supply}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-mono text-cyan-400">Location</h3>
                  <p className="mt-1 text-white">
                    {listing.metadata.location}
                    {listing.metadata.isOnline && " (Online)"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-mono text-cyan-400">
                    Seller FID
                  </h3>
                  <p className="mt-1 text-white">{listing.fid}</p>
                </div>
              </div>

              {/* Payment details */}
              <div className="rounded-lg bg-slate-800/50 p-4 border border-slate-700">
                <p className="text-sm font-mono text-cyan-400">
                  Payment Details
                </p>
                <p className="mt-1 text-slate-300">
                  Seller prefers USDC on Base, but accepts any token on any
                  chain through cross-chain swaps
                </p>
              </div>

              {/* Action button */}
              {listing.isActive ? (
                <button
                  type="button"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-shadow disabled:opacity-50 disabled:pointer-events-none"
                  disabled={listing.remainingSupply === 0}
                  aria-label={`Purchase ${listing.metadata.name}`}
                >
                  {listing.remainingSupply === 0 ? (
                    <span className="font-mono">SOLD OUT</span>
                  ) : (
                    <span className="font-mono">PURCHASE NOW</span>
                  )}
                </button>
              ) : (
                <div className="text-center font-mono text-red-400">
                  THIS LISTING IS NO LONGER ACTIVE
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-slate-900 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6">
          <h1 className="text-2xl font-bold text-red-400 font-mono">ERROR</h1>
          <p className="mt-4 text-slate-400">
            {error instanceof Error ? error.message : "Failed to load listing"}
          </p>
        </div>
      </div>
    );
  }
}
