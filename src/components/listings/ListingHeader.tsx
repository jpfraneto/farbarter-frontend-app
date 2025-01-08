interface ListingHeaderProps {
  listingId: string;
  name: string;
  description: string;
}

export function ListingHeader({
  listingId,
  name,
  description,
}: ListingHeaderProps) {
  return (
    <div>
      <div className="text-cyan-400 text-sm font-mono">
        Listing #{listingId}
      </div>
      <h1 className="mt-1 text-2xl font-bold text-white">{name}</h1>
      <p className="mt-2 text-slate-400">{description}</p>
    </div>
  );
}
