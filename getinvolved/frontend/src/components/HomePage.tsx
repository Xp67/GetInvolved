import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from './AppTheme'
import AppAppBar from './ui/AppAppBar';
import Hero from './ui/Hero';
import LogoCollection from './ui/LogoCollection';
import Highlights from './ui/Highlights';
import Pricing from './ui/Pricing';
import Features from './ui/Features';
import Testimonials from './ui/Testimonials';
import FAQ from './ui/FAQ';
import Footer from './ui/Footer';

export default function MarketingPage(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />

      <AppAppBar />
      <Hero />
      <div>
        <LogoCollection />
        <Features />
        <Divider />
        <Testimonials />
        <Divider />
        <Highlights />
        <Divider />
        <Pricing />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </div>
    </AppTheme>
  );
}
