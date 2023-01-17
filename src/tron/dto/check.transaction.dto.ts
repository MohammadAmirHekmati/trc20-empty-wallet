    export interface ContractData {
        amount: number;
        owner_address: string;
        to_address: string;
    }

    export interface Cost {
        multi_sign_fee: number;
        net_fee: number;
        net_fee_cost: number;
        energy_usage: number;
        fee: number;
        energy_fee_cost: number;
        energy_fee: number;
        energy_usage_total: number;
        memoFee: number;
        origin_energy_usage: number;
        account_create_fee: number;
        net_usage: number;
    }

    export interface TriggerInfo {
    }

    export interface InternalTransactions {
    }

    export interface SrConfirmList {
        address: string;
        name: string;
        block: number;
        url: string;
    }

    export interface Info {
    }

    export interface AddressTag {
    }

    export interface ContractInfo {
    }

    export interface ContractMap {
        TL1F6QV4zV6wqRfKQUMQcS2LyEiUSwo2LU: boolean;
        TCKyDNjrhRQCLY1DZnJGxUWiURqvuXgX2q: boolean;
    }

    export interface CheckTransactionDto {
        block: number;
        hash: string;
        timestamp: number;
        ownerAddress: string;
        signature_addresses: any[];
        contractType: number;
        toAddress: string;
        confirmations: number;
        confirmed: boolean;
        revert: boolean;
        contractRet: string;
        contractData: ContractData;
        cost: Cost;
        data: string;
        trigger_info: TriggerInfo;
        internal_transactions: InternalTransactions;
        srConfirmList: SrConfirmList[];
        info: Info;
        addressTag: AddressTag;
        contractInfo: ContractInfo;
        contract_map: ContractMap;
    }
