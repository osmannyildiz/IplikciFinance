"use client";

import { useParams } from "next/navigation";
import SupplyDetail from "../../../pages/SupplyDetail";
import type { NextPage } from "next";

const SupplyDetailPage: NextPage = () => {
  const params = useParams();
  const asset = params?.asset as string;

  return <SupplyDetail asset={asset} />;
};

export default SupplyDetailPage;
