type UmbracoFile = {
	src: string;
	focalPoint: any | null;
	crops: any[] | null;
};

type Image = {
	alternateText: string;
	description: string;
	umbracoBytes: string;
	umbracoExtension: string;
	umbracoFile: UmbracoFile;
	umbracoHeight: string;
	umbracoWidth: string;
	id: number;
	sortOrder: number;
	name: string;
	urlName: string;
	documentTypeAlias: string;
	level: number;
	url: string;
	itemType: number;
};

type Link = {
	id: string | null;
	name: string;
	url: string;
	target: string | null;
	type: number;
};

type ImageLinkItem = {
	image: Image;
	link: Link[];
	mobileImage: Image;
	id: number;
	sortOrder: number;
	name: string;
	urlName: string | null;
	documentTypeAlias: string;
	level: number;
	url: string;
	itemType: number;
};

type Area = {
	id: number;
	name: string;
};

type NetworkingType = {
	savedValue: string;
	pickedKeys: string[];
};

type NetworkingCube = {
	address: string;
	areas: Area[];
	city: string;
	deliversEnabled: boolean;
	fieldProperty: string;
	icon: Image;
	nameInAnotherLanguage: string;
	nameInUpperLetters: string;
	networkingType: NetworkingType;
	phone: string;
	pickupEnabled: boolean;
	placeId: string;
	placeName: string;
	sitInPlaceEnabled: boolean;
	websilteLink: Link[];
	id: number;
	sortOrder: number;
	name: string;
	urlName: string;
	documentTypeAlias: string;
	level: number;
	url: string;
	itemType: number;
};

export type GoldJson = {
	isSucceeded: boolean;
	content: {
		contentEncoding: any;
		contentType: any;
		jsonRequestBehavior: number;
		maxJsonLength: any;
		recursionLimit: any;
		data: {
			contentPage: {
				metaTitle: string;
				carouselBannerSider: ImageLinkItem[];
				videoCarouselVideoList: ImageLinkItem[];
				adsBannerBuyButton: Link[];
				adsBannerChargeButton: Link[];
				adsBannerDesktopImage: Image;
				adsBannerMobileImage: Image;
				networksHiveDisclaimer: string;
				[key: string]: any; // for other optional fields
			};
			networkingCubes: NetworkingCube[];
			[key: string]: any;
		};
	};
	errors: {
		message: string;
		code: number;
	};
};
