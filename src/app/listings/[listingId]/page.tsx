import farbarter_abi from "../../../lib/farbarter_abi.json";
import { createPublicClient, formatUnits, http } from "viem";
import Image from "next/image";
import { degen } from "viem/chains";

const FARBARTER_CONTRACT_ADDRESS = "0x8d59e8ef33fb819979ad09fb444a26792970fb6f";

const client = createPublicClient({
  chain: degen,
  transport: http(),
});

interface Metadata {
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
  metadata: Metadata;
  isActive: boolean;
  totalSales: number;
  preferredToken: string;
  preferredChain: number;
}

async function getListingDetails(listingId: string): Promise<ListingDetails> {
  const details = (await client.readContract({
    address: FARBARTER_CONTRACT_ADDRESS,
    abi: farbarter_abi,
    functionName: "getListingDetails",
    args: [BigInt(listingId)],
  })) as [
    string,
    bigint,
    bigint,
    bigint,
    string,
    boolean,
    bigint,
    string,
    bigint
  ];

  const metadata = (await fetch(details[4]).then((res) =>
    res.json()
  )) as Metadata;

  return {
    seller: details[0],
    fid: Number(details[1]),
    price: formatUnits(details[2], 6), // USDC has 6 decimals
    remainingSupply: Number(details[3]),
    metadata,
    isActive: details[5],
    totalSales: Number(details[6]),
    preferredToken: details[7],
    preferredChain: Number(details[8]),
  };
}

export default async function ListingPage({
  params,
}: {
  params: { listingId: string };
} & { searchParams: { [key: string]: string | string[] | undefined } }) {
  const listing = await getListingDetails(params.listingId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            {listing.metadata.imageUrl && (
              <Image
                src={listing.metadata.imageUrl}
                alt={listing.metadata.name}
                width={400}
                height={400}
                className="h-48 w-full object-cover md:h-full md:w-48"
              />
            )}
          </div>
          <div className="p-8">
            <div className="text-sm text-gray-500">
              Listing #{params.listingId}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              {listing.metadata.name}
            </h1>
            <p className="mt-4 text-gray-600">{listing.metadata.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Price</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {listing.price} USDC
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Available</h3>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {listing.remainingSupply} / {listing.metadata.supply}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
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
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Purchase Now
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
}
