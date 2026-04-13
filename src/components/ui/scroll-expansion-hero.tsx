'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  titleLine1?: string;
  titleLine2?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  titleLine1,
  titleLine2,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [isMobileState, setIsMobileState] = useState<boolean>(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  // Use refs for touch tracking (state is async, refs are instant)
  const touchStartYRef = useRef<number>(0);
  const scrollProgressRef = useRef<number>(0);
  const mediaFullyExpandedRef = useRef<boolean>(false);

  // Keep refs in sync with state
  scrollProgressRef.current = scrollProgress;
  mediaFullyExpandedRef.current = mediaFullyExpanded;

  const line1 = titleLine1 || (title ? title.split(',')[0] : '');
  const line2 = titleLine2 || (title ? title.split(',').slice(1).join(',').trim() : '');

  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
    scrollProgressRef.current = 0;
    mediaFullyExpandedRef.current = false;
  }, [mediaType]);

  useEffect(() => {
    const handleWheel = (e: globalThis.WheelEvent) => {
      if (mediaFullyExpandedRef.current && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        mediaFullyExpandedRef.current = false;
        e.preventDefault();
      } else if (!mediaFullyExpandedRef.current) {
        e.preventDefault();
        const scrollDelta = e.deltaY * 0.0009;
        const newProgress = Math.min(
          Math.max(scrollProgressRef.current + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);
        scrollProgressRef.current = newProgress;

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          mediaFullyExpandedRef.current = true;
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }
      }
    };

    const handleTouchStart = (e: globalThis.TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (!touchStartYRef.current) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - touchY;

      if (mediaFullyExpandedRef.current && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        mediaFullyExpandedRef.current = false;
        e.preventDefault();
      } else if (!mediaFullyExpandedRef.current) {
        e.preventDefault();
        const scrollFactor = deltaY < 0 ? 0.006 : 0.004;
        const scrollDelta = deltaY * scrollFactor;
        const newProgress = Math.min(
          Math.max(scrollProgressRef.current + scrollDelta, 0),
          1
        );
        setScrollProgress(newProgress);
        scrollProgressRef.current = newProgress;

        if (newProgress >= 1) {
          setMediaFullyExpanded(true);
          mediaFullyExpandedRef.current = true;
          setShowContent(true);
        } else if (newProgress < 0.75) {
          setShowContent(false);
        }

        touchStartYRef.current = touchY;
      }
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = 0;
    };

    const handleScroll = () => {
      if (!mediaFullyExpandedRef.current) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobileState(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Mobile: start smaller, expand more dramatically
  const mediaWidth = isMobileState
    ? 180 + scrollProgress * 800
    : 300 + scrollProgress * 1250;
  const mediaHeight = isMobileState
    ? 240 + scrollProgress * 400
    : 400 + scrollProgress * 400;
  const textTranslateX = scrollProgress * (isMobileState ? 120 : 150);

  return (
    <div
      ref={sectionRef}
      className='transition-colors duration-700 ease-in-out overflow-x-hidden'
    >
      <section className='relative flex flex-col items-center justify-start min-h-[100dvh]'>
        <div className='relative w-full flex flex-col items-center min-h-[100dvh]'>
          {/* Background image layer */}
          <motion.div
            className='absolute inset-0 z-0 h-full'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <Image
              src={bgImageSrc}
              alt='Background'
              width={1920}
              height={1080}
              className='w-screen h-screen'
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              priority
            />
            <div className='absolute inset-0 bg-deep-teal/80' />
          </motion.div>

          <div className='container mx-auto flex flex-col items-center justify-start relative z-10'>
            <div className='flex flex-col items-center justify-center w-full h-[100dvh] relative'>

              {/* Title line 1 - ABOVE the video */}
              <motion.h2
                className='font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-ivory text-center transition-none tracking-tight relative z-20 mb-6 md:mb-8 px-4'
                style={{
                  transform: `translateX(-${textTranslateX}vw)`,
                  fontVariationSettings: "'opsz' 144",
                  textShadow: '0 2px 40px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.3)',
                }}
              >
                {line1}
              </motion.h2>

              {/* Expanding media container */}
              <div
                className='relative z-10 transition-none rounded-2xl'
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: '95vw',
                  maxHeight: isMobileState ? '50vh' : '55vh',
                  boxShadow: '0px 4px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212,175,55,0.15)',
                }}
              >
                {mediaType === 'video' ? (
                  mediaSrc.includes('youtube.com') ? (
                    <div className='relative w-full h-full pointer-events-none'>
                      <iframe
                        width='100%'
                        height='100%'
                        src={
                          mediaSrc.includes('embed')
                            ? mediaSrc +
                              (mediaSrc.includes('?') ? '&' : '?') +
                              'autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1'
                            : mediaSrc.replace('watch?v=', 'embed/') +
                              '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=' +
                              mediaSrc.split('v=')[1]
                        }
                        className='w-full h-full rounded-xl'
                        frameBorder='0'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className='relative w-full h-full pointer-events-none'>
                      <video
                        src={mediaSrc}
                        poster={posterSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload='auto'
                        className='w-full h-full object-cover rounded-xl'
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                      />
                    </div>
                  )
                ) : (
                  <div className='relative w-full h-full'>
                    <Image
                      src={mediaSrc}
                      alt={title || 'Media content'}
                      width={1280}
                      height={720}
                      className='w-full h-full object-cover rounded-xl'
                    />
                  </div>
                )}
              </div>

              {/* Title line 2 - BELOW the video */}
              <motion.h2
                className='font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-center text-gold transition-none tracking-tight relative z-20 mt-6 md:mt-8 px-4'
                style={{
                  transform: `translateX(${textTranslateX}vw)`,
                  fontVariationSettings: "'opsz' 144",
                  textShadow: '0 2px 40px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.3)',
                }}
              >
                {line2}
              </motion.h2>

              {/* Scroll hint */}
              {scrollToExpand && (
                <p
                  className='text-ivory/50 font-body font-medium text-center text-sm mt-4 md:mt-6 relative z-20 transition-none'
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {scrollToExpand}
                </p>
              )}
            </div>

            {/* Children content (rest of page) */}
            <motion.section
              className='flex flex-col w-full'
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
