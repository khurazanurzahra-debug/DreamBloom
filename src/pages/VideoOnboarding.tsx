import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, animate as animateMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { ArrowRight, Sprout } from "lucide-react";
import { useDream } from "../context/DreamContext";

const VIDEO_URL = `${import.meta.env.BASE_URL}videos/onboarding.mp4`;
const ZOOM_TARGET_SCALE = 1.045;
const ZOOM_DURATION_SECONDS = 10;

export default function VideoOnboarding() {
  const navigate = useNavigate();
  const { setHasOnboarded, isCloudConfigured, isHouseholdConnected } = useDream();

  // Drives the cinematic zoom via a raw motion value (bound through `style`, not the
  // `animate` prop) so it can be paused/resumed imperatively without ever touching the
  // <video> element's own props — the element itself never remounts or restarts.
  const scale = useMotionValue(1);
  const zoomControlsRef = useRef<AnimationPlaybackControls | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    if (!isVideoReady) return;
    if (isBuffering) {
      // Hold the zoom exactly where it is — do not reset, do not restart.
      zoomControlsRef.current?.pause();
      return;
    }
    if (zoomControlsRef.current) {
      zoomControlsRef.current.play();
    } else {
      zoomControlsRef.current = animateMotionValue(scale, ZOOM_TARGET_SCALE, {
        duration: ZOOM_DURATION_SECONDS,
        ease: "easeInOut",
      });
    }
  }, [isVideoReady, isBuffering, scale]);

  useEffect(() => {
    return () => zoomControlsRef.current?.stop();
  }, []);

  function handleVideoReady() {
    setIsVideoReady(true);
  }
  function handleWaiting() {
    setIsBuffering(true);
  }
  function handlePlaying() {
    setIsBuffering(false);
    setIsVideoReady(true);
  }

  function handleContinue() {
    setHasOnboarded(true);
    // Only ever detours to the one-time household connect step when a Supabase project
    // is actually configured; with no env vars set, this is unchanged from before.
    navigate(isCloudConfigured && !isHouseholdConnected ? "/connect-household" : "/profile");
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-ink">
      {/* Background video — plays normally first; the zoom only engages once playback has
          actually started (canplay/loadeddata/playing), and pauses in place (no reset,
          no remount) whenever the browser reports buffering. */}
      <motion.video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        style={{ scale, willChange: "transform" }}
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={handleVideoReady}
        onCanPlay={handleVideoReady}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
      />

      {/* Champagne shimmer */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] animate-shimmer"
        style={{
          background:
            "linear-gradient(120deg, rgba(198,166,112,0.25) 0%, transparent 40%, rgba(242,232,213,0.15) 70%)",
        }}
      />

      {/* Dark gradient for readability */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />

      {/* Content — delayed reveal, text + glass button only, no logo/title over the video */}
      <div className="relative z-10 flex h-full flex-col items-center justify-end gap-6 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.3 }}
        >
          <div
            className="mx-auto mb-4 h-px w-16"
            style={{
              background: "linear-gradient(to right, transparent, rgba(198,166,112,0.85), transparent)",
              filter: "drop-shadow(0 0 5px rgba(198,166,112,0.5))",
            }}
          />
          <p className="text-[15px] leading-relaxed text-white/95">
            Langkah kecil hari ini,
            <br />
            untuk masa depan yang lebih indah.
          </p>
          <Sprout
            size={16}
            className="mx-auto mt-3 text-gold"
            style={{ filter: "drop-shadow(0 0 5px rgba(198,166,112,0.6))" }}
          />
        </motion.div>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleContinue}
          className="flex w-full max-w-[300px] items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md"
          style={{
            background: "rgba(255,248,241,0.12)",
            border: "1px solid rgba(198,166,112,0.65)",
            boxShadow: "0 0 18px rgba(198,166,112,0.32), 0 8px 20px rgba(0,0,0,0.18)",
          }}
        >
          Mulai
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/40">
            <ArrowRight size={13} />
          </span>
        </motion.button>
      </div>
    </div>
  );
}
