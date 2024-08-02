import React, { useMemo } from "react";

interface TriangleIconProps {
  isVertical: boolean;
  firstIcon: boolean;
}

const calculateRotation = (first: boolean, isVertical: boolean) => {
  if (!isVertical) {
    return first ? "rotate(0deg)" : "rotate(180deg)";
  } else {
    return first ? "rotate(-90deg)" : "rotate(90deg)";
  }
};

const TriangleIcon: React.FC<TriangleIconProps> = ({ isVertical, firstIcon }) => {
  const rotation = useMemo(() => calculateRotation(firstIcon, isVertical), [firstIcon, isVertical]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="31"
      viewBox="0 0 36 31"
      fill="none"
      style={{ transform: rotation }}
    >
      <g filter="url(#filter0_d_121_502)">
        <path
          d="M21.1206 23.1083C19.5194 25.1052 16.4806 25.1052 14.8794 23.1083L1.56344 6.50234C-0.536127 3.88403 1.32791 -3.64309e-06 4.68406 -3.34969e-06L31.3159 -1.02145e-06C34.6721 -7.28048e-07 36.5361 3.88403 34.4366 6.50235L21.1206 23.1083Z"
          fill="url(#paint0_linear_121_502)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_121_502"
          x="0.676514"
          y="0"
          width="34.647"
          height="30.606"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_121_502" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_121_502"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_121_502"
          x1="18"
          y1="-9"
          x2="18"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFE500" />
          <stop offset="1" stopColor="#FFEDBE" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default TriangleIcon;
