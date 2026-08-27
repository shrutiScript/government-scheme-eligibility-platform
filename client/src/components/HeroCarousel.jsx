import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_BANNERS } from '../data/banners';

// Import Swiper core and module styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const HeroCarousel = () => {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full max-w-full p-0 m-0 mb-8 sm:mb-12">
      {/* 
        Full Screen-Sized Hero Carousel Container
        Fills 100% of visible viewport height below header (100vh - 68px)
      */}
      <div className="relative w-full h-[calc(100vh-68px)] min-h-[450px] rounded-none overflow-hidden bg-[#0f2942] group">
        
        {/* Swiper React Component */}
        <Swiper
          modules={[Autoplay, Pagination]}
          direction="horizontal"
          effect="slide"
          speed={800}
          loop={true}
          grabCursor={true}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full h-full"
        >
          {HERO_BANNERS.map((banner, index) => (
            <SwiperSlide key={banner.id} className="w-full h-full overflow-hidden select-none">
              <Link
                to={banner.link}
                className="block w-full h-full relative group/link"
                aria-label={`View details for ${banner.title}`}
              >
                {/* Banner Image */}
                <img
                  src={banner.image}
                  alt={banner.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />

                {/* Ambient Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 group-hover/link:opacity-30 transition-opacity" />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Pure Icon Navigation Button - Previous */}
        <button
          onClick={() => swiperInstance?.slidePrev()}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform sm:-translate-x-2 group-hover:translate-x-0 hover:scale-110 active:scale-95 cursor-pointer z-30 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
        >
          <ChevronLeft className="w-9 h-9 sm:w-12 sm:h-12 stroke-[2]" />
        </button>

        {/* Custom Pure Icon Navigation Button - Next */}
        <button
          onClick={() => swiperInstance?.slideNext()}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform sm:translate-x-2 group-hover:translate-x-0 hover:scale-110 active:scale-95 cursor-pointer z-30 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
        >
          <ChevronRight className="w-9 h-9 sm:w-12 sm:h-12 stroke-[2]" />
        </button>

      </div>
    </section>
  );
};
