import { useEffect, useRef, useState } from "react";

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let hasScrolled = window.scrollY > 0;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        hasScrolled = true;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (hasScrolled && entry.isIntersecting) {
          setVisible(true);
        } else if (!entry.isIntersecting) {
          setVisible(false);
        }
      },
      {
        threshold: 0.15,
      }
    );

    window.addEventListener("scroll", handleScroll);
    observer.observe(element);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return [ref, visible];
}

export default useScrollReveal;