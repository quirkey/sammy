
/* rdiscount extension configuration */

#undef USE_AMALLOC

#define TABSTOP 4

#if HAVE_RANDOM
#define COINTOSS() (random()&1)
#elif HAVE_RAND
#define COINTOSS() (rand()&1)
#endif

#if HAVE_SRANDOM
#define INITRNG(x) srandom((unsigned int)x)
#elif HAVE_SRAND
#define INITRNG(x) srand((unsigned int)x)
#endif

#define RELAXED_EMPHASIS 1
#define SUPERSCRIPT 1
