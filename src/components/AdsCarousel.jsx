import { useEffect, useState } from "react";
import { getAds } from "@/services/api";

export default function AdsCarousel() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    getAds().then(setAds);
  }, []);

  if (ads.length === 0) return null;

  return (
    <div className="my-4 px-2">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="flex-shrink-0 w-80 rounded-2xl bg-white shadow overflow-hidden"
          >
            <img
              src={ad.image}
              alt={ad.text}
              className="w-full h-40 object-cover"
            />
            <div className="p-3">
              <p className="font-semibold">{ad.text}</p>
              {ad.price && (
                <p className="text-red-500 font-bold">
                  {parseFloat(ad.price)} сум
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
