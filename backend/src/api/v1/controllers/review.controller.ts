import {BaseController} from "./base.controller";
import {Review} from "../../../orm/entities/Review";
import {BookingController} from "./booking.controller";
import {ConflictError, ForbiddenRequest, NotFoundError} from "../errors/Errors";

export class ReviewController extends BaseController<Review> {
    constructor() {
        super(Review);
        this.entityColumns.required_columns = [
            'reviewed', 'review', 'rating'
        ];
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
                    "Couldn't create booking",
                    {failed: 'create', reason: reason}
                );
            }
        }

        this.checkData(data);
        let reviewed = null;
        let reviewer = booking.owner.id === reviewer_id ? booking.owner : booking.sitter;

        if ('reviewed' in data) {
            if (booking.owner.id === data.reviewed)
                reviewed = booking.owner;
            else if (booking.sitter.id === data.reviewed)
                reviewed = booking.sitter;
            else
                throw new NotFoundError(
                    "Use not found",
                    {failed: "create", reason: "'reviewed' id neither belongs to the owner nor the sitter"}
                );
        }

        if (reviewed && reviewed.id === reviewer.id) {
            throw new ForbiddenRequest(
                "Couldn't create review",
                {failed: 'create', reason: 'A user cannot review him/herself'}
                );
        }

        data = {...data, reviewed: reviewed, reviewer: reviewer, booking: booking};
        const review = this.repository.create(data);
        await this.propertyValidation(reviewed, "Couldn't create review");
        return this.repository.save(review);
    }
}