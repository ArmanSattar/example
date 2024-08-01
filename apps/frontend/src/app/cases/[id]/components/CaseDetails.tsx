import React, { useEffect } from "react";
import Image from "next/image";
import { CaseMetaData } from "./CaseMetaData";

interface CaseDetailsProps {
  name: string;
  price: number;
  tag: string;
  imagePath: string;
  highestPrice: number;
  lowestPrice: number;
  numberOfItems: number;
  onLoaded: () => void;
}

export const CaseDetails: React.FC<CaseDetailsProps> = ({
  name,
  price,
  tag,
  imagePath,
  highestPrice,
  lowestPrice,
  numberOfItems,
  onLoaded,
}) => {
  // const { data, isLoading, isError } = useFetchImage(`${GET_CASES_URL}${imagePath}`);
  const isLoading = false;

  useEffect(() => {
    if (!isLoading) {
      onLoaded();
    }
  }, [isLoading]);

  // if (isError) {
  //   toast.error("Error fetching image");
  //   return <div>Error fetching image</div>;
  // }

  // if (!isLoading && !data) {
  //   return <div>No image found</div>;
  // }

  return (
    <div className="relative flex flex-col sm:flex-row justify-start sm:items-center items-start w-full gap-10 sm:gap-4 -mt-10">
      <div className="relative flex justify-center sm:justify-start items-center w-full sm:w-max">
        <div className="flex justify-center items-center min-w-[225px] sm:min-w-[320px] min-h-[100px] -mt-10">
          <Image
            // src={data || "/cases/cases_blender.png"}
            src={"/cases/case_blender.png"}
            alt={name}
            height={320}
            width={320}
            objectFit="contain"
            className="object-contain"
          />
        </div>
      </div>
      <CaseMetaData
        name={name}
        highestPrice={highestPrice}
        lowestPrice={lowestPrice}
        totalItems={numberOfItems}
        price={price}
        label={tag}
      />
    </div>
  );
};
