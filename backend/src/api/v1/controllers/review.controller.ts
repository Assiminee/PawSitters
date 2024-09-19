import {BaseController} from "./base.controller";
import {Review} from "../../../orm/entities/Review";
import {BookingController} from "./booking.controller";
import {ConflictError, ForbiddenRequest, NotFoundError} from "../errors/Errors";
import {Booking} from "../../../orm/entities/Booking";
/**
 * ReviewController class extends the BaseController to manage Review-related operations.
 */
export class ReviewController extends BaseController<Review> {
    constructor() {
        super(Review);

        // Defines allowed columns for creating/updating Review entities
        this.entityColumns.allowed_columns = ['review', 'rating'];

        // Defines required columns that must be present in the Review entity
        this.entityColumns.required_columns = ['review'];
    }

    /**
     * Creates a new review for a completed booking.
     * @param reviewer_id - ID of the user submitting the review (could be owner or sitter).
     * @param booking_id - ID of the booking related to the review.
     * @param data - The review data (e.g., review text, rating).
     * @returns The newly created review with reviewer and reviewed minimal info.
     * @throws ConflictError if the booking is not completed or the user has already submitted a review.
     */
    public createReview = async (reviewer_id : string, booking_id: string, data: object) => {
        // Get the booking details to ensure it exists and matches the reviewer
        const booking = await (new BookingController()).getBooking(reviewer_id, booking_id);

        // Ensure the booking has been completed before allowing a review
        if (booking.status !== 'COMPLETED') {
            const reason = "A sitter/owner can only be reviewed if the booking has been fulfilled";
            throw new ConflictError(
                "Couldn't create booking",
                {failed: 'create', reason: reason}
            );
        }

        // Check if the reviewer has already submitted a review for this booking
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

        // Validate that the provided review data contains the necessary fields
        this.checkData(data);

        // Determine if the reviewer is the owner or the sitter and set the 'reviewed' and 'reviewer' fields accordingly
        let reviewer = booking.owner.id === reviewer_id ? booking.owner : booking.sitter;
        let reviewed = booking.owner.id === reviewer_id ? booking.sitter : booking.owner;

        // Attach the reviewer and reviewed entities to the review data
        data = {...data, reviewed: reviewed, reviewer: reviewer};

        // Create the review entity and validate it
        const review = this.repository.create(data);
        await this.propertyValidation(review, "Could not create review");

        // Push the newly created review into the booking's reviews array and save the booking
        booking.reviews.push(review);
        await Booking.save(booking);

        // Return the newly created review along with minimal information for the reviewer and reviewed users
        return {
            ...review,
            reviewed: reviewed.getMinimalInfo(),
            reviewer: reviewer.getMinimalInfo()
        }
    }
}