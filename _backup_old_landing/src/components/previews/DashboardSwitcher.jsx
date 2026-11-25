import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HRPreview from './HRPreview';
import SalesPreview from './SalesPreview';
import ProjectsPreview from './ProjectsPreview';
import FinancePreview from './FinancePreview';
import AnalyticsPreview from './AnalyticsPreview';

const previews = [
  <HRPreview key="0" />,
  <SalesPreview key="1" />,
  <ProjectsPreview key="2" />,
  <FinancePreview key="3" />,
  <AnalyticsPreview key="4" />
];

export default function DashboardSwitcher({ activeIndex }) {
  return (
    <div className="w-full h-full relative bg-[#F8FAFC] dark:bg-[#0B1222] rounded-[26px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {previews[activeIndex] || previews[0]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
