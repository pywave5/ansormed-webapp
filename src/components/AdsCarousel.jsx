import { useEffect, useState } from "react";
import { getAds } from "../services/api";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function AdsCarousel() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    getAds()
      .then((data) => {
        if (Array.isArray(data)) {
          setAds(data);
        } else if (data?.results) {
          setAds(data.results);
        } else {
          setAds([]);
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки рекламы:", err);
      });
  }, []);

  if (!ads || ads.length === 0) return null;

  return (
    <div className="my-4 px-2">
      <Swiper
        modules={[Autoplay]}
        loop={true} // 🔁 бесконечный цикл
        autoplay={{
          delay: 3000, // смена каждые 3 секунды
          disableOnInteraction: false, // автоплей не останавливается при свайпе
        }}
        spaceBetween={16}
        slidesPerView={1}
        centeredSlides={true}
        grabCursor={true} // чтобы можно было тянуть мышкой
      >
        {ads.map((ad) => (
          <SwiperSlide key={ad.id}>
            <div className="w-80 mx-auto rounded-2xl bg-white shadow-md overflow-hidden">
              <img
                src={ad.image}
                alt=""
                className="w-full h-40 object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
