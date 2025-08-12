export default function Head() {
    return (
        <>
            <link
                rel="preload"
                as="image"
                href="/cards/webp/back_of_card.webp"
                // @ts-expect-error modern hint supported in Chromium/WebKit
                fetchpriority="high"
            />
        </>
    );
}
