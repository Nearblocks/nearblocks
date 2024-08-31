// 'use client';
// import classNames from 'classnames';
// import { usePathname, useRouter, useSearchParams } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
// import QueryString from 'qs';

// // Simulated absence of the translation function
// const t = (key: string, p?: any): string | undefined => {
//   p = {};
//   const simulateAbsence = true; // Set to true to simulate absence of t
//   return simulateAbsence ? undefined : key; // Return undefined to simulate absence
// };

// const tabs = [
//   'txns',
//   'tokentxns',
//   'nfttokentxns',
//   'accesskeys',
//   'contract',
//   'comments',
// ];

// export default function AddressTabActions({
//   parse,
//   tab,
//   children,
// }: {
//   parse: any;
//   tab: string;
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // const contractData = data?.

//   const [tabIndex, setTabIndex] = useState(0);

//   useEffect(() => {
//     // Get the index of the current tab in the tabs array
//     const currentIndex = tabs.indexOf(tab);

//     // Set the tabIndex state to the found index
//     setTabIndex(currentIndex !== -1 ? currentIndex : 0); // Fallback to 0 if tab is not found
//   }, [tab]);

//   const getClassName = (selected: boolean) =>
//     classNames(
//       'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
//       {
//         'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
//           !selected,
//         'bg-green-600 dark:bg-green-250 text-white': selected,
//       },
//     );
//   const onTab = (index: number) => {
//     const hasContractTab =
//       parse?.contract?.[0]?.contract &&
//       parse?.contract?.[0]?.contract?.methodNames.length > 0;
//     let actualTabName = tabs[index];
//     let actualTabIndex = index;

//     if (!hasContractTab && index > 3) {
//       actualTabIndex = index;
//       actualTabName = tabs[actualTabIndex + 1];
//     }

//     // Parse existing search params using qs
//     const currentParams = QueryString.parse(searchParams?.toString() || '');

//     // Update the tab parameter
//     currentParams.tab = actualTabName;

//     // Optionally reset cursor and pagination when switching tabs
//     delete currentParams.cursor;
//     delete currentParams.p;

//     // Convert the updated params back to a query string
//     const newSearchParams = QueryString.stringify(currentParams);

//     console.log({ actualTabIndex });
//     console.log({ actualTabName });

//     // Push the updated URL with new search params
//     router.push(`${pathname}?${newSearchParams}`);
//     // router.refresh();
//   };

//   return (
//     <div className="block lg:flex lg:space-x-2 mb-10">
//       <div className="w-full">
//         <>
//           <div>
//             <Tabs onSelect={onTab} selectedIndex={tabIndex}>
//               <TabList className="flex flex-wrap">
//                 {[
//                   { key: 0, label: t('address:txns') || 'Transactions' },
//                   {
//                     key: 1,
//                     label: t('address:tokenTxns') || 'Token Txns',
//                   },
//                   {
//                     key: 2,
//                     label: t('address:nftTokenTxns') || 'NFT Token Txns',
//                   },
//                   {
//                     key: 3,
//                     label: t('address:accessKeys') || 'Access Keys',
//                   },
//                   ...(parse?.contract?.[0]?.contract &&
//                   parse?.contract?.[0]?.contract?.methodNames.length > 0
//                     ? [
//                         {
//                           key: 4,
//                           label: (
//                             <div className="flex h-full">
//                               <h2>Contract</h2>
//                               <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md ml-11 -mt-3 px-1">
//                                 NEW
//                               </div>
//                             </div>
//                           ),
//                         },
//                         // {
//                         //   key: 5,
//                         //   label: t('address:comments') || 'Comments',
//                         // },
//                       ]
//                     : [
//                         // {
//                         //   key: 4,
//                         //   label: t('address:comments') || 'Comments',
//                         // },
//                       ]),
//                 ].map(({ key, label }) => (
//                   <Tab
//                     key={key}
//                     className={getClassName(tabs[key] === tabs[tabIndex])}
//                     selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
//                   >
//                     <h2>{label}</h2>
//                   </Tab>
//                 ))}
//               </TabList>
//               <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
//                 <TabPanel>{children}</TabPanel>
//                 <TabPanel>{children}</TabPanel>
//                 <TabPanel>{children}</TabPanel>
//                 <TabPanel>{children}</TabPanel>
//                 {parse?.contract?.[0]?.contract &&
//                   parse?.contract?.[0]?.contract?.methodNames.length > 0 && (
//                     <TabPanel>{children}</TabPanel>
//                   )}
//                 {/* <TabPanel>
//                   {tab === 'comments' ? (
//                     <VmComponent
//                       src={components?.commentsFeed}
//                       defaultSkelton={<Comment />}
//                       props={{
//                         network: network,
//                         path: `nearblocks.io/address/${id}`,
//                         limit: 10,
//                         requestSignInWithWallet,
//                       }}
//                       loading={<Comment />}
//                     />
//                   ) : (
//                     <div className="w-full h-[500px]"></div>
//                   )}
//                 </TabPanel> */}
//               </div>
//             </Tabs>
//           </div>
//         </>
//       </div>
//     </div>
//   );
// }
