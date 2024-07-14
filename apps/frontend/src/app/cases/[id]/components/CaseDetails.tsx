import React from "react";
import Image from "next/image";
import { CaseMetaData } from "./CaseMetaData";
import { useFetchImage } from "../hooks/useFetchImage";
import { GET_CASES_URL } from "../../../types";
import { toast } from "sonner";

interface CaseDetailsProps {
  name: string;
  price: number;
  rarity: string;
  tag: string;
  imagePath: string;
}

export const CaseDetails: React.FC<CaseDetailsProps> = ({
  name,
  price,
  rarity,
  tag,
  imagePath,
}) => {
  const { data, isLoading, isError } = useFetchImage(`${GET_CASES_URL}${imagePath}`);

  // TODO - Add loading spinner
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    toast.error("Error fetching image");
    return <div>Error fetching image</div>;
  }

  if (!isLoading && !data) {
    return <div>No image found</div>;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-start sm:items-center items-start w-full space-y-4">
      <div className="relative">
        <Image
          src={data || "/images/placeholder.png"}
          alt={name}
          height={100}
          width={225}
          objectFit="contain"
          className="object-contain"
        />
      </div>
      <CaseMetaData
        name={name}
        highestPrice={200}
        lowestPrice={1}
        totalItems={12}
        price={price}
        label={tag}
      />
    </div>
  );
};
