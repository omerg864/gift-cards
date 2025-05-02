export interface BranchLocation {
	longitude: string | null;
	latitude: string | null;
}

export interface Branch {
	businessId: string;
	branchId: number;
	storeName: string;
	businessAlias: string;
	businessLogoFile: string;
	branchName: string;
	phone: string;
	address: string;
	location: BranchLocation;
}

export interface BranchData {
	branchesCount: number;
	goodToKnow: string;
	branches: Branch[];
}

export interface NofshonitJson {
	status: boolean;
	data: BranchData;
}
