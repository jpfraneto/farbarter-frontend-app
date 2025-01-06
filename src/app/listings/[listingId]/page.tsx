import { Metadata } from "next";
import farbarter_abi from "../../../lib/farbarter_abi.json";
import { createPublicClient, formatUnits, http, type Address } from "viem";
import Image from "next/image";
import { degen } from "viem/chains";
import { Suspense } from "react";

const FARBARTER_CONTRACT_ADDRESS =
  "0x8d59e8ef33fb819979ad09fb444a26792970fb6f" as Address;

const client = createPublicClient({
  chain: degen,
  transport: http(),
});

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
  if (!listingId || isNaN(Number(listingId))) {
    throw new Error("Invalid listing ID");
  }

  try {
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

    const metadataResponse = await fetch(details[4]);
    if (!metadataResponse.ok) throw new Error("Failed to fetch metadata");
    const metadata = (await metadataResponse.json()) as ListingMetadata;

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
    if (error instanceof Error) {
      throw new Error(`Failed to fetch listing details: ${error.message}`);
    }
    throw new Error("Failed to fetch listing details");
  }
}

export async function generateMetadata({
  params,
}: {
  params: { listingId: string };
}): Promise<Metadata> {
  try {
    const listing = await getListingDetails(params.listingId);
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
    return {
      title: "Listing | Farbarter",
      description: "View listing details on Farbarter",
    };
  }
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 rounded-t-lg md:w-48" />
      <div className="p-8">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded mt-2 w-3/4" />
        <div className="h-20 bg-gray-200 rounded mt-4" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: { listingId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  try {
    console.log("the search params", searchParams);
    const listing = await getListingDetails(params.listingId);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <Suspense fallback={<LoadingSkeleton />}>
                {listing.metadata.imageUrl && (
                  <Image
                    src={listing.metadata.imageUrl}
                    alt={listing.metadata.name}
                    width={400}
                    height={400}
                    className="h-48 w-full object-cover md:h-full md:w-48"
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                )}
              </Suspense>
            </div>
            <div className="p-8">
              <div className="text-sm text-gray-500">
                Listing #{params.listingId}
              </div>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">
                {listing.metadata.name}
              </h1>
              <p className="mt-4 text-gray-600">
                {listing.metadata.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {listing.price} USDC
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Available
                  </h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {listing.remainingSupply} / {listing.metadata.supply}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Location
                  </h3>
                  <p className="mt-1 text-gray-900">
                    {listing.metadata.location}
                    {listing.metadata.isOnline && " (Online)"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Seller FID
                  </h3>
                  <p className="mt-1 text-gray-900">{listing.fid}</p>
                </div>
              </div>

              <div className="mt-8">
                <div className="rounded-md bg-gray-50 p-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-500">Payment Details</p>
                    <p className="mt-1 text-gray-700">
                      Seller prefers USDC on Base, but accepts any token on any
                      chain through cross-chain swaps
                    </p>
                  </div>
                </div>
              </div>

              {listing.isActive ? (
                <div className="mt-8">
                  <button
                    type="button"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    disabled={listing.remainingSupply === 0}
                    aria-label={`Purchase ${listing.metadata.name}`}
                  >
                    {listing.remainingSupply === 0
                      ? "Sold Out"
                      : "Purchase Now"}
                  </button>
                </div>
              ) : (
                <div className="mt-8">
                  <p className="text-center text-red-600 font-medium">
                    This listing is no longer active
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-4 text-gray-600">
            {error instanceof Error ? error.message : "Failed to load listing"}
          </p>
        </div>
      </div>
    );
  }
}
