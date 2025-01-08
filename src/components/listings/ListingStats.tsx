interface ListingStatsProps {
  price: string;
  remainingSupply: number;
  totalSupply: number;
  location: string;
  isOnline: boolean;
  fid: number;
}

export function ListingStats({
  price,
  remainingSupply,
  totalSupply,
  location,
  isOnline,
  fid,
}: ListingStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-700">
      <div>
        <h3 className="text-sm font-mono text-cyan-400">Price</h3>
        <p className="mt-1 text-xl font-bold text-white">{price} USDC</p>
      </div>
      <div>
        <h3 className="text-sm font-mono text-cyan-400">Available</h3>
        <p className="mt-1 text-xl font-bold text-white">
          {remainingSupply} / {totalSupply}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-mono text-cyan-400">Location</h3>
        <p className="mt-1 text-white">
          {location}
          {isOnline && " (Online)"}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-mono text-cyan-400">Seller FID</h3>
        <p className="mt-1 text-white">{fid}</p>
      </div>
      <div className="col-span-2">
        <div className="rounded-lg bg-slate-800/50 p-4 border border-slate-700 mt-4">
          <p className="text-sm font-mono text-cyan-400">Payment Details</p>
          <p className="mt-1 text-slate-300">
            Seller prefers USDC on Base, but accepts any token on any chain
            through cross-chain swaps
          </p>
        </div>
      </div>
    </div>
  );
}
