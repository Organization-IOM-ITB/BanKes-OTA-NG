'use client'
import React from 'react';
import Image from 'next/image';

// Footer diselaraskan dengan iom-itb-app-NG (src/components/footer/FooterItem.vue)
const IOM_APP_URL = (process.env.NEXT_PUBLIC_IOM_APP_URL || 'https://www.iom-itb.id').replace(/\/$/, '');

const ICON_BLUE_FILTER =
	'brightness(0) saturate(100%) invert(15%) sepia(61%) saturate(1200%) hue-rotate(187deg) brightness(90%) contrast(102%)';

const profilLinks = [
	{ label: 'Latar Belakang', href: `${IOM_APP_URL}/tentang-kami` },
	{ label: 'Struktur Kepengurusan', href: `${IOM_APP_URL}/tentang-kami` },
	{ label: 'Visi dan Misi', href: `${IOM_APP_URL}/tentang-kami` },
];

const kontakLinks = [
	{ icon: 'email', label: 'info@iom-itb.id', href: 'mailto:info@iom-itb.id' },
	{ icon: 'whatsapp', label: '+62 856-2465-4990', href: 'https://wa.me/6285624654990' },
	{ icon: 'whatsapp', label: '+62 878-5401-9415', href: 'https://wa.me/6287854019415' },
	{ icon: 'instagram', label: 'iom_itb.official', href: 'https://www.instagram.com/iom_itb.official' },
	{ icon: 'youtube', label: '@iom-itb', href: 'https://youtube.com/@iom-itb' },
];

const Footer: React.FC = () => {
	return (
		<footer className="bg-lightmain text-footertext py-10">
			<div className="mx-auto px-6 sm:px-16 md:px-24 lg:px-40">
				<div className="flex flex-col md:flex-row md:flex-wrap gap-8 md:gap-0">
					<div className="w-full md:w-1/2 lg:w-5/12 md:pr-10">
						<div className="flex items-center mb-4">
							<Image
								src="/footer/iom-itb-logo-blue.png"
								alt="IOM-ITB"
								width={100}
								height={100}
								className="w-[100px] h-auto mr-4"
							/>
							<div>
								<p className="text-lg font-bold leading-tight">Ikatan Orang Tua Mahasiswa</p>
								<p className="text-sm leading-tight">Institut Teknologi Bandung</p>
							</div>
						</div>
						<p className="mb-4 text-sm">
							Sekretariat IOM-ITB Gedung Kampus Center Timur ITB Lantai 2 Jl. Ganesha No. 10 Kec. Coblong, Bandung 40132.
						</p>
					</div>

					<div className="w-full md:w-1/2 lg:w-3/12">
						<h5 className="font-semibold mb-2">PROFIL</h5>
						<ul className="space-y-2">
							{profilLinks.map((link) => (
								<li key={link.label}>
									<a href={link.href} className="hover:underline">
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					<div className="w-full md:w-1/2 lg:w-4/12">
						<h5 className="font-semibold mb-2">KONTAK</h5>
						{kontakLinks.map((item) => (
							<a
								key={item.href}
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 mb-1 hover:underline"
							>
								<Image
									src={`/footer/${item.icon}.svg`}
									alt=""
									width={18}
									height={18}
									className="w-[18px] h-[18px]"
									style={{ filter: ICON_BLUE_FILTER }}
								/>
								<span>{item.label}</span>
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
