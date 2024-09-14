import {BaseController} from "./base.controller";
import {Review} from "../../../orm/entities/Review";
import {BookingController} from "./booking.controller";
import {ConflictError, ForbiddenRequest, NotFoundError} from "../errors/Errors";
import {Booking} from "../../../orm/entities/Booking";

export class ReviewController extends BaseController<Review> {
    constructor() {
        super(Review);
        this.entityColumns.allowed_columns = ['review', 'rating'];
        this.entityColumns.required_columns = ['review'];
    }

    public createReview = async (reviewer_id : string, booking_id: string, data: object) => {
        const booking = await (new BookingController()).getBooking(reviewer_id, booking_id);

        if (booking.status !== 'COMPLETED') {
            const reason = "A sitter/owner can only be reviewed if the booking has been fulfilled";
            throw new ConflictError(
                "Couldn't create booking",
                {failed: 'create', reason: reason}
            );
        }

        if (booking.reviews) {
            const review = booking.reviews.find(review => review.reviewer.id === reviewer_id);
            if (review) {
                const reason = "This user has already submitted a review for this booking";
                throw new ConflictError(
                    "Couldn't create review",
                    {failed: 'create', reason: reason}
                );
            }
        }

        this.checkData(data);
        let reviewer = booking.owner.id === reviewer_id ? booking.owner : booking.sitter;
        let reviewed = booking.owner.id === reviewer_id ? booking.sitter : booking.owner;

        data = {...data, reviewed: reviewed, reviewer: reviewer};
        const review = this.repository.create(data);
        await this.propertyValidation(review, "Could not create review");
        booking.reviews.push(review);
        const savedBooking = await Booking.save(booking);
        return {
            ...review,
            reviewed: reviewed.getMinimalInfo(),
            reviewer: reviewer.getMinimalInfo()
        }
    }
}