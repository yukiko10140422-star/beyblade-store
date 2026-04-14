import {Link} from 'react-router';
import {LockIcon} from '~/components/icons';
import {FloatingParticles, GlowOrb, motion} from '~/components/motion';

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-vault-950">
      {/* Tokyo night skyline background */}
      <div className="absolute inset-0">
        <img
          src="/images/tokyo-night.jpg"
          alt="Tokyo night skyline — home of Tokyo Spin Vault"
          className="w-full h-full object-cover object-center opacity-30"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-vault-950/80 to-vault-950/60" />
      </div>

      {/* Ambient glow orbs */}
      <GlowOrb className="w-96 h-96 bg-gold-400/10 top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <GlowOrb className="w-64 h-64 bg-electric-500/5 bottom-1/4 right-1/4" />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,215,0,0.06)_0%,_transparent_50%)]" />

      {/* Rotating rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-gold-400/[0.08]"
          animate={{rotate: 360}}
          transition={{duration: 20, repeat: Infinity, ease: 'linear'}}
        />
        <motion.div
          className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-gold-400/[0.05]"
          animate={{rotate: -360}}
          transition={{duration: 15, repeat: Infinity, ease: 'linear'}}
        />
        <motion.div
          className="absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full border border-gold-400/[0.03]"
          animate={{rotate: 360}}
          transition={{duration: 25, repeat: Infinity, ease: 'linear'}}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.img
          src="/images/logo-transparent.png"
          alt="Tokyo Spin Vault"
          className="mx-auto h-32 md:h-52 w-auto mb-6 drop-shadow-[0_0_40px_rgba(255,215,0,0.4)] mix-blend-screen"
          initial={{opacity: 0, scale: 0.8, y: 20}}
          animate={{opacity: 1, scale: 1, y: 0}}
          transition={{duration: 1, ease: [0.16, 1, 0.3, 1]}}
        />

        <motion.h1
          className="font-heading text-3xl md:text-5xl lg:text-6xl text-gold-metallic uppercase tracking-wider mb-4"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1]}}
        >
          Enter the Vault
        </motion.h1>

        <motion.p
          className="text-chrome-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1]}}
        >
          Premium authentic Beyblades, sourced direct from Japan.
          <br className="hidden md:block" />
          Rare finds. Exclusive drops. Collector grade.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1]}}
        >
          <Link
            to="/collections/all"
            className="group inline-flex items-center gap-3 bg-gold-500 hover:bg-gold-400 text-vault-950 font-heading uppercase tracking-[0.2em] text-xs md:text-sm px-8 py-4 rounded-lg transition-all duration-300 hover:glow-gold-lg"
          >
            <LockIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
            Enter the Vault
          </Link>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 border border-vault-600 hover:border-gold-400/30 text-chrome-300 hover:text-gold-400 font-heading uppercase tracking-[0.2em] text-xs md:text-sm px-8 py-4 rounded-lg transition-all duration-300"
          >
            Browse Collections
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{y: [0, 8, 0]}}
        transition={{duration: 2, repeat: Infinity, ease: 'easeInOut'}}
      >
        <svg
          className="w-5 h-5 text-gold-400/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7"
          />
        </svg>
      </motion.div>
    </section>
  );
}
