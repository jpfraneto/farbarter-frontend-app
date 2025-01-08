import { createPublicClient, formatUnits, http, type Address } from "viem";
import { degen } from "viem/chains";
import axios from "axios";
import farbarter_abi from "./farbarter_abi.json";

export interface ListingDetails {
  seller: Address;
  fid: number;
  price: string;
  remainingSupply: number;
  metadata: ListingMetadata;
  isActive: boolean;
  totalSales: number;
  preferredToken: string;
  preferredChain: number;
}

export interface ListingMetadata {
  name: string;
  description: string;
  imageUrl: string;
  location: string;
  supply: number;
  isOnline: boolean;
}

const FARBARTER_CONTRACT_ADDRESS =
  "0x8d59e8ef33fb819979ad09fb444a26792970fb6f" as Address;

const client = createPublicClient({
  chain: degen,
  transport: http(),
});

export async function getListingDetails(
  listingId: string
): Promise<ListingDetails> {
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

    const metadata = await fetchMetadataFromIpfs(details[4]);

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

async function fetchMetadataFromIpfs(
  ipfsHash: string
): Promise<ListingMetadata> {
  try {
    const response = await axios.get(
      `https://anky.mypinata.cloud/ipfs/${ipfsHash}`
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch metadata from IPFS");
  }
}
