"use client";

import { useParams } from "next/navigation";
import BorrowDetail from "../../../pages/BorrowDetail";
import type { NextPage } from "next";

const BorrowDetailPage: NextPage = () => {
  const params = useParams();
  const asset = params?.asset as string;

  return <BorrowDetail asset={asset} />;
};

export default BorrowDetailPage;
