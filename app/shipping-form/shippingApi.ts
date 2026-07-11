export type ShippingDraft = {
    name: string;
    express: boolean;
    quantity: number;
};

export const loadDraft = async (): Promise<ShippingDraft> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { name: "Ada Moreno", express: false, quantity: 1 };
};
