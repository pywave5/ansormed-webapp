import { useEffect, useState } from "react";
import { getAds } from "../services/api";

export default function AdsCarousel() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    getAds().then((data) => {
      if (Array.isArray(data.results)) {
        setAds(data.results);
      }
    });
  }, []);

  if (!ads || ads.length === 0) return null;

  return (
    <div className="my-4 px-2">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="flex-shrink-0 w-80 rounded-2xl bg-white shadow-md overflow-hidden"
          >
            <img
              src={ad.image}
              alt={ad.text}
              className="w-full h-40 object-cover"
            />
            <div className="p-3 space-y-1">
              <p className="text-gray-800 font-medium text-sm">{ad.text}</p>
              {ad.price && (
                <p className="text-red-600 font-bold text-base">
                  {parseInt(ad.price)} сум
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
