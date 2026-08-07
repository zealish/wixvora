import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.7"],
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/staff/users",
        destination: "/staff/staffs",
        permanent: true,
      },
      {
        source: "/staff/users/create",
        destination: "/staff/staffs/create",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
