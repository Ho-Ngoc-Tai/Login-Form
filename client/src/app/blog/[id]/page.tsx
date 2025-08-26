type BlogPageProps = {
    params: {
        id: string;
    };
};

export default function BlogPage({ params }: BlogPageProps) {
    return (
        <div>
            <h1>Chi tiết bài viết</h1>
            <p>ID từ URL: {params.id}</p>
        </div>
    );
}
