export declare const getCurrencyRate: (currency: string) => Promise<{
    id: number;
    updated_at: Date;
    currency: string;
    rate: import("@prisma/client/runtime/library").Decimal;
    is_enabled: boolean;
} | null>;
export declare const getCurrency: (currency: string) => Promise<{
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
export declare const getAllCurrencies: (page?: number, limit?: number, search?: string, is_enabled?: boolean) => Promise<{
    data: {
        id: number;
        updated_at: Date;
        currency: string;
        rate: import("@prisma/client/runtime/library").Decimal;
        is_enabled: boolean;
    }[];
    meta: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}>;
export declare const updateCurrencyRate: (currency: string, rate: number) => Promise<{
    id: number;
    updated_at: Date;
    currency: string;
    rate: import("@prisma/client/runtime/library").Decimal;
    is_enabled: boolean;
}>;
export declare const updateCurrencyStatus: (currency: string, is_enabled: boolean) => Promise<{
    id: number;
    updated_at: Date;
    currency: string;
    rate: import("@prisma/client/runtime/library").Decimal;
    is_enabled: boolean;
}>;
//# sourceMappingURL=currency.service.d.ts.map