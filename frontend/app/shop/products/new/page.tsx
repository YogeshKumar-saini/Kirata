'use client';

import { ProductForm } from "@/components/shop/products/product-form";
import { PageHeader } from "@/components/ui/PageHeader";
import { motion } from "framer-motion";

export default function NewProductPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <PageHeader
                title="Add New Product"
                description="Add a new item to your shop's inventory."
                breadcrumbs={[
                    { label: "Dashboard", href: "/shop" },
                    { label: "Products", href: "/shop/products" },
                    { label: "New Product" },
                ]}
                showBackButton={true}
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-xl border border-sidebar-border/50 p-6 md:p-8"
            >
                <ProductForm mode="create" />
            </motion.div>
        </div>
    );
}
