/** Release years of the AI² models, for display and chronological ordering only (never used by a codec).
 * Main source: Wikipedia, « List of Korg products » (read 2026-10-25). Gaps: 03R/W from the Sound On Sound review of
 * May 1992; N5EX from Audiofanzine (1999, other sources say 1998). Details and links: docs/MODEL-YEARS.md. */
export const ai2ModelYears:Readonly<Record<string,number>>=Object.freeze({
 '01/W':1991,'01/Wfd':1991,'01R/W':1991,'01/Wpro':1991,'01/WproX':1991,'03R/W':1992,
 'X2':1993,'X3':1993,'X3R':1993,'05R/W':1994,'X5':1994,'X5D':1995,'X5DR':1995,
 'N264':1996,'N364':1996,'NS5R':1997,'N1':1998,'N1R':1998,'N5':1998,'N5EX':1999,'NX5R':1999,
})
