"use client";

import { useState, ChangeEvent } from "react";

interface Props {
  title?: string;
}

export default function Landing({ title = "farbarter" }: Props) {
  const [showSellModal, setShowSellModal] = useState(false);
  const [amount, setAmount] = useState("8");
  const [qrCodeData, setQrCodeData] = useState("");
  const [currentPaymentLink, setCurrentPaymentLink] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy Link");

  const showAmountPicker = () => {
    setShowSellModal(true);
    setQrCodeData("");
  };

  const handleSell = async () => {
    try {
      const uuid = crypto.randomUUID();
      const response = await fetch(
        "https://farcaster.anky.bot/daimo/create-sale",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            amount,
            idempotencyKey: uuid,
          }),
        }
      );

      const data: { paymentLink?: string } = await response.json();

      if (data.paymentLink) {
        setCurrentPaymentLink(data.paymentLink);
        setQrCodeData(data.paymentLink);
      } else {
        alert("Error generating payment link. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSell:", error);
      alert("Error processing sale. Please try again.");
    }
  };

  const handleBuy = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      alert(
        "When someone clicks the sell button, they get a QR code. To pay that item, you need to scan that code with your phone's camera"
      );
    } else {
      alert("You can only scan QR codes on a mobile device");
    }
  };

  const copyPaymentLink = async () => {
    try {
      await navigator.clipboard.writeText(currentPaymentLink);
      setCopyButtonText("Copied!");
      setTimeout(() => {
        setCopyButtonText("Copy Link");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("Failed to copy link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] relative font-['Space_Grotesk']">
      <div className="min-h-screen flex flex-col items-center p-8 relative bg-[radial-gradient(circle_at_top_right,#6366f1_0%,transparent_60%),radial-gradient(circle_at_bottom_left,#ec4899_0%,transparent_60%)]">
        <h1 className="text-6xl md:text-7xl font-bold my-8 bg-gradient-to-r from-[#f8fafc] to-[rgba(248,250,252,0.8)] bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
          {title}
        </h1>

        <div className="w-full h-[2px] my-8 relative bg-gradient-to-r from-transparent via-[#6366f1] to-transparent">
          <div className="absolute -top-[15px] left-0 right-0 h-[30px] bg-inherit blur-[20px] opacity-50"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 my-8 w-full max-w-[800px] justify-center">
          <button
            onClick={showAmountPicker}
            className="px-10 py-4 text-xl font-semibold rounded-2xl bg-[rgba(99,102,241,0.1)] text-[#f8fafc] cursor-pointer transition-all duration-300 backdrop-blur-[10px] border border-[rgba(99,102,241,0.2)] min-w-[200px] relative overflow-hidden hover:translate-y-[-2px] hover:bg-[rgba(99,102,241,0.2)] hover:shadow-[0_10px_20px_rgba(99,102,241,0.2)]"
          >
            sell
          </button>
          <button
            onClick={handleBuy}
            className="px-10 py-4 text-xl font-semibold rounded-2xl bg-[rgba(99,102,241,0.1)] text-[#f8fafc] cursor-pointer transition-all duration-300 backdrop-blur-[10px] border border-[rgba(99,102,241,0.2)] min-w-[200px] relative overflow-hidden hover:translate-y-[-2px] hover:bg-[rgba(99,102,241,0.2)] hover:shadow-[0_10px_20px_rgba(99,102,241,0.2)]"
          >
            buy
          </button>
        </div>

        {showSellModal && (
          <div className="fixed inset-0 bg-[rgba(15,23,42,0.9)] backdrop-blur-md flex justify-center items-center p-4 z-50">
            <div className="bg-[#1e293b] rounded-3xl p-10 w-full max-w-[500px] border border-[#334155] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
              {!qrCodeData ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAmount(e.target.value)
                      }
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full p-4 bg-[#334155] border border-white/10 rounded-xl text-[#f8fafc] text-base transition-all focus:outline-none focus:border-[#6366f1] focus:shadow-[0_0_0_2px_rgba(99,102,241,0.2)]"
                    />
                    <div className="text-xl font-semibold text-[#6366f1]">
                      USDC
                    </div>
                  </div>
                  <button
                    onClick={handleSell}
                    className="w-full px-10 py-4 text-xl font-semibold rounded-2xl bg-[rgba(99,102,241,0.1)] text-[#f8fafc] cursor-pointer transition-all duration-300 backdrop-blur-[10px] border border-[rgba(99,102,241,0.2)] hover:bg-[rgba(99,102,241,0.2)] hover:shadow-[0_10px_20px_rgba(99,102,241,0.2)]"
                  >
                    sell
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-white p-6 rounded-2xl w-fit mx-auto mb-6">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
                        qrCodeData
                      )}`}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <button
                    onClick={copyPaymentLink}
                    className="w-full p-3 bg-[#334155] text-[#f8fafc] border border-white/10 rounded-xl text-base cursor-pointer transition-all hover:bg-[#6366f1] hover:border-[#6366f1]"
                  >
                    {copyButtonText}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
