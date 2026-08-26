import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ThreadDivider from '@/components/ThreadDivider'
import Marquee from '@/components/Marquee'
import Collections from '@/components/Collections'
import Spotlight from '@/components/Spotlight'
import FullRange from '@/components/FullRange'
import Origin from '@/components/Origin'
import Craft from '@/components/Craft'
import Promise from '@/components/Promise'
import Sizes from '@/components/Sizes'
import Testimonials from '@/components/Testimonials'
import Gallery from '@/components/Gallery'
import Newsletter from '@/components/Newsletter'
import Enquire from '@/components/Enquire'
import Footer from '@/components/Footer'
import { EnquiryProvider } from '@/components/EnquiryContext'
import { RugViewerProvider } from '@/components/RugViewerContext'
import RugModalMount from '@/components/RugModalMount'
import ScrollProgress from '@/components/ScrollProgress'
import BackToTop from '@/components/BackToTop'
import StructuredData from '@/components/StructuredData'

export default function HomePage() {
  return (
    <EnquiryProvider>
      <RugViewerProvider>
      <StructuredData />

      <div className="announce">
        Handwoven in Bhadohi &amp; Mirzapur &nbsp;·&nbsp; Designed in{' '}
        <span>Jaipur</span> &nbsp;·&nbsp; Custom sizes on every rug
      </div>

      <Header />
      <ScrollProgress />

      <main id="top">
        <Hero />
        <ThreadDivider />
        <Marquee />
        <Collections />
        <Spotlight />
        <FullRange />
        <Origin />
        <Craft />
        <Promise />
        <Sizes />
        <Testimonials />
        <Gallery />
        <Newsletter />
        <Enquire />
      </main>

      <Footer />

      {/* Overlays live outside <main> so the dialog isn't nested inside content. */}
      <RugModalMount />
      <BackToTop />
      </RugViewerProvider>
    </EnquiryProvider>
  )
}
