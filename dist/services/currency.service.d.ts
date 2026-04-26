export declare const getCurrencyRate: (currency: string) => Promise<{
    id: number;
    updated_at: Date;
    currency: string;
    rate: import("@prisma/client/runtime/library").Decimal;
    is_enabled: boolean;
} | null>;
export declare const getAllCurrencyService: () => Promise<{
    id: number;
    updated_at: Date;
    currency: string;
    rate: import("@prisma/client/runtime/library").Decimal;
    is_enabled: boolean;
}[]>;
export declare const updateCurrencyRate: (currency: string, rate: number) => Promise<{
    id: number;
    updated_at: Date;
    currency: string;
    rate: import("@prisma/client/runtime/library").Decimal;
    is_enabled: boolean;
}>;
//# sourceMappingURL=currency.service.d.ts.map