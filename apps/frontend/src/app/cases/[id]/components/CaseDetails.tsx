import React, { useEffect } from "react";
import Image from "next/image";
import { useFetchImage } from "../hooks/useFetchImage";
import { GET_CASES_URL } from "../../../types";
import { toast } from "sonner";
import { Tag } from "../../components/Tag";
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
  const { data, isLoading, isError } = useFetchImage(`${GET_CASES_URL}${imagePath}`);

  useEffect(() => {
    if (!isLoading) {
      onLoaded();
    }
  }, [isLoading]);

  if (isError) {
    toast.error("Error fetching image");
    return <div>Error fetching image</div>;
  }

  if (!isLoading && !data) {
    return <div>No image found</div>;
  }

  return (
    <div className={"w-full flex justify-center items-center -mt-[8vh]"}>
      <div className="relative flex flex-col justify-start h-full max-w-[40vw] items-center main-element rounded-md p-4 gap-2">
        <div className={"flex-col flex justify-start items-center gap-4"}>
          <div className="flex gap-6 justify-between items-center mb-4">
            <span className="text-white font-bold text-3xl whitespace-nowrap">{name}</span>
            {tag !== "" && <Tag name={tag} customStyle={"!text-lg !px-3"} />}
          </div>
          <div className="relative flex justify-center items-center -mt-12 w-[200px] h-[200px] lg:w-[300px] lg:h-[275px]">
            <Image
              src={data || "/images/placeholder.png"}
              alt={name}
              fill={true}
              objectFit="contain"
              className="object-contain"
            />
          </div>
          <CaseMetaData
            name={name}
            highestPrice={highestPrice}
            lowestPrice={lowestPrice}
            totalItems={numberOfItems}
            label={tag}
          />
        </div>
      </div>
    </div>
  );
};
