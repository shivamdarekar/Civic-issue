"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (!role) {
      router.push("/login");
      return;
    }

    switch (role) {
      case "FIELD_WORKER":
        router.push("/dashboard/field-worker");
        break;
      case "WARD_ENGINEER":
        router.push("/dashboard/ward-engineer");
        break;
      case "ZONE_OFFICER":
        router.push("/dashboard/zone-officer");
        break;
      case "SUPER_ADMIN":
        router.push("/dashboard/admin");
        break;
    }
  }, [router]);

  return null;
}
