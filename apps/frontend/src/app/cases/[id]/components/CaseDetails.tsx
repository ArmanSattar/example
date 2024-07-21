import React, { useEffect } from "react";
import Image from "next/image";
import { useFetchImage } from "../hooks/useFetchImage";
import { GET_CASES_URL } from "../../../types";
import { toast } from "sonner";
import { Tag } from "../../components/Tag";
import { Money } from "../../../components/Money";

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
    <div className="relative flex flex-col sm:flex-row justify-start xl:gap-12 sm:items-center items-start w-full gap-10 sm:gap-4 rounded-xl -mt-[5vh]">
      <div className="relative flex justify-start sm:justify-start items-center w-full sm:w-max">
        <div className="flex justify-center items-center min-w-[150px] sm:min-w-[150px] min-h-[100px] -mt-10">
          <Image
            src={data || "/images/placeholder.png"}
            alt={name}
            height={150}
            width={150}
            objectFit="contain"
            className="object-contain"
          />
          <div className={"flex flex-col justify-start items-start"}>
            <div className={"flex gap-2 justify-between items-center"}>
              <span className="text-white font-bold text-2xl">{name}</span>
              {tag !== "" && <Tag name={tag} customStyle={"!text-md !px-3"} />}
            </div>
            <Money amount={price} />
          </div>
        </div>
      </div>
      {/*<CaseMetaData*/}
      {/*  name={name}*/}
      {/*  highestPrice={highestPrice}*/}
      {/*  lowestPrice={lowestPrice}*/}
      {/*  totalItems={numberOfItems}*/}
      {/*  label={tag}*/}
      {/*/>*/}
    </div>
  );
};
