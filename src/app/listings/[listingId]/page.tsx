import { Metadata } from "next";
import { getListingDetails } from "../../../lib/listings";
import ListingContainer from "../../../components/listings/ListingContainer";

interface ListingPageProps {
  params: {
    listingId: string;
  };
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
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

export default function ListingPage({ params }: ListingPageProps) {
  return <ListingContainer listingId={params.listingId} />;
}
